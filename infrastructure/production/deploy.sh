#!/usr/bin/env bash
#
# Deploys the Forseti CloudFormation stacks in dependency order.
#
#   deploy.sh shared [--dry-run]
#       Account-wide stacks: ECR repositories and the CloudFront certificate (in us-east-1). Once per account.
#
#   deploy.sh <production|staging> [options] [stack ...]
#       The stacks of one environment. Without stack names all of them are deployed, in order:
#       network secrets platform storage messaging database cache core autojudge api-edge webapp
#       "mode" is shorthand for the stacks that change between idle and contest mode:
#       database cache core autojudge
#
# Options:
#   --mode idle|contest   Operating mode. Left out, every stack keeps the mode it already has (idle on first deploy).
#   --version <tag>       Image tag of Core and autojudge. Left out, they keep the tag they already have.
#   --tasks <n|default>   Number of Core tasks, overriding the mode. 0 keeps Core stopped (first deployment, while the
#                         database migrations are applied); "default" goes back to the number of the mode.
#   --dry-run             Create the change sets but do not execute them.
#   --yes                 Do not ask for confirmation before switching production to idle.
#   -h, --help            Show this help.
#
# Needs the AWS CLI with credentials that can manage the stacks. Settings come from environments/<target>.env.
# Set AWS_BIN to use a different CLI binary.

set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STACKS_DIR="$HERE/stacks"
ENV_STACKS=(network secrets platform storage messaging database cache core autojudge api-edge webapp)
MODE_STACKS=(database cache core autojudge)
AWS_BIN="${AWS_BIN:-aws}"

usage() {
  sed -n '2,25p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
}

log() { printf '==> %s\n' "$*" >&2; }
die() { printf 'error: %s\n' "$*" >&2; exit 1; }

aws_cli() { "$AWS_BIN" "$@"; }

# Prints the value of a stack output, or nothing when the stack or the output does not exist
stack_output() {
  local region="$1" stack="$2" key="$3" value
  value="$(aws_cli cloudformation describe-stacks --region "$region" --stack-name "$stack" \
    --query "Stacks[0].Outputs[?OutputKey=='${key}'].OutputValue | [0]" --output text 2>/dev/null || true)"
  if [[ "$value" != "None" ]]; then
    printf '%s' "$value"
  fi
}

lookup_hosted_zone_id() {
  local zone
  zone="$(aws_cli route53 list-hosted-zones-by-name --dns-name "$DOMAIN" --max-items 1 \
    --query "HostedZones[?Name=='${DOMAIN}.'].Id | [0]" --output text)"
  if [[ -z "$zone" || "$zone" == "None" ]]; then
    die "no Route 53 hosted zone found for ${DOMAIN}. Set HOSTED_ZONE_ID in the environment file."
  fi
  printf '%s' "${zone#/hostedzone/}"
}

deploy_stack() {
  local stack="$1" template="$2" region="$3"
  shift 3
  local cmd=(cloudformation deploy
    --region "$region"
    --stack-name "$stack"
    --template-file "$template"
    --capabilities CAPABILITY_IAM
    --no-fail-on-empty-changeset
    --tags "Project=forseti" "Environment=${TAG_ENVIRONMENT}")
  if [[ "$DRY_RUN" == true ]]; then
    cmd+=(--no-execute-changeset)
  fi
  if (($# > 0)); then
    cmd+=(--parameter-overrides "$@")
  fi
  log "deploying ${stack} (${region})"
  aws_cli "${cmd[@]}"
}

is_selected() {
  local wanted="$1" name
  if ((${#SELECTED[@]} == 0)); then
    return 0
  fi
  for name in "${SELECTED[@]}"; do
    if [[ "$name" == "$wanted" ]]; then
      return 0
    fi
  done
  return 1
}

# ---------------------------------------------------------------------------
# Arguments
# ---------------------------------------------------------------------------
if (($# == 0)); then
  usage
  exit 1
fi

TARGET="$1"
shift
case "$TARGET" in
  -h | --help)
    usage
    exit 0
    ;;
  shared | production | staging) ;;
  *) die "unknown target '${TARGET}'. Use shared, production or staging." ;;
esac

MODE=""
VERSION=""
TASKS=""
DRY_RUN=false
ASSUME_YES=false
SELECTED=()

while (($# > 0)); do
  case "$1" in
    --mode)
      MODE="${2:?--mode needs idle or contest}"
      shift 2
      ;;
    --version)
      VERSION="${2:?--version needs an image tag}"
      shift 2
      ;;
    --tasks)
      TASKS="${2:?--tasks needs a number or default}"
      shift 2
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --yes)
      ASSUME_YES=true
      shift
      ;;
    -h | --help)
      usage
      exit 0
      ;;
    -*) die "unknown option '$1'" ;;
    *)
      SELECTED+=("$1")
      shift
      ;;
  esac
done

if [[ -n "$MODE" && "$MODE" != idle && "$MODE" != contest ]]; then
  die "--mode must be idle or contest"
fi
if [[ -n "$TASKS" && "$TASKS" != default && ! "$TASKS" =~ ^[0-9]+$ ]]; then
  die "--tasks must be a number or default"
fi

# ---------------------------------------------------------------------------
# Settings
# ---------------------------------------------------------------------------
ENV_FILE="$HERE/environments/${TARGET}.env"
[[ -f "$ENV_FILE" ]] || die "missing ${ENV_FILE}"
# shellcheck source=/dev/null
source "$ENV_FILE"
: "${REGION:?REGION is not set in ${ENV_FILE}}"
: "${DOMAIN:?DOMAIN is not set in ${ENV_FILE}}"
HOSTED_ZONE_ID="${HOSTED_ZONE_ID:-}"

# ---------------------------------------------------------------------------
# Shared stacks
# ---------------------------------------------------------------------------
if [[ "$TARGET" == shared ]]; then
  if ((${#SELECTED[@]} > 0)); then
    die "the shared target has no stack selection"
  fi
  : "${CERTIFICATE_REGION:?CERTIFICATE_REGION is not set in ${ENV_FILE}}"
  TAG_ENVIRONMENT=shared
  if [[ -z "$HOSTED_ZONE_ID" ]]; then
    HOSTED_ZONE_ID="$(lookup_hosted_zone_id)"
  fi

  deploy_stack forseti-registry "$STACKS_DIR/shared/registry.yaml" "$REGION"
  deploy_stack forseti-certificate "$STACKS_DIR/shared/certificate.yaml" "$CERTIFICATE_REGION" \
    "Domain=${DOMAIN}" "HostedZoneId=${HOSTED_ZONE_ID}"
  log "certificate ARN: $(stack_output "$CERTIFICATE_REGION" forseti-certificate CertificateArn)"
  exit 0
fi

# ---------------------------------------------------------------------------
# Environment stacks
# ---------------------------------------------------------------------------
ENV_NAME="$TARGET"
TAG_ENVIRONMENT="$ENV_NAME"
ALARM_EMAIL="${ALARM_EMAIL:-}"
CLOUDFRONT_CERTIFICATE_ARN="${CLOUDFRONT_CERTIFICATE_ARN:-}"

case "$ENV_NAME" in
  production)
    APP_DOMAIN="$DOMAIN"
    API_DOMAIN="api.${DOMAIN}"
    ;;
  staging)
    APP_DOMAIN="staging.${DOMAIN}"
    API_DOMAIN="api.staging.${DOMAIN}"
    ;;
esac

# Expand the "mode" shorthand and validate the stack names
EXPANDED=()
for name in "${SELECTED[@]+"${SELECTED[@]}"}"; do
  if [[ "$name" == mode ]]; then
    EXPANDED+=("${MODE_STACKS[@]}")
    continue
  fi
  known=false
  for stack in "${ENV_STACKS[@]}"; do
    if [[ "$stack" == "$name" ]]; then
      known=true
    fi
  done
  if [[ "$known" != true ]]; then
    die "unknown stack '${name}'. Known stacks: ${ENV_STACKS[*]} (or: mode)"
  fi
  EXPANDED+=("$name")
done
SELECTED=("${EXPANDED[@]+"${EXPANDED[@]}"}")

# Switching production to idle resizes the database and shrinks the fleets: never by accident during a contest
if [[ "$ENV_NAME" == production && "$MODE" == idle && "$DRY_RUN" != true && "$ASSUME_YES" != true ]]; then
  switches_mode=false
  for stack in "${MODE_STACKS[@]}"; do
    if is_selected "$stack"; then
      switches_mode=true
    fi
  done
  if [[ "$switches_mode" == true ]]; then
    printf 'This puts production in IDLE mode: the database is resized and loses its standby, and the Core and\n' >&2
    printf 'autojudge fleets shrink. Only do it when no contest is running.\n' >&2
    read -r -p "Type '${ENV_NAME}' to continue: " answer
    if [[ "$answer" != "$ENV_NAME" ]]; then
      die "aborted"
    fi
  fi
fi

if [[ -z "$HOSTED_ZONE_ID" ]]; then
  HOSTED_ZONE_ID="$(lookup_hosted_zone_id)"
fi
if [[ -z "$CLOUDFRONT_CERTIFICATE_ARN" ]] && { is_selected api-edge || is_selected webapp; }; then
  CLOUDFRONT_CERTIFICATE_ARN="$(stack_output us-east-1 forseti-certificate CertificateArn)"
  [[ -n "$CLOUDFRONT_CERTIFICATE_ARN" ]] \
    || die "no CloudFront certificate found. Run './deploy.sh shared' first or set CLOUDFRONT_CERTIFICATE_ARN."
fi

stack_name() { printf '%s-forseti-%s' "$ENV_NAME" "$1"; }

# The alarm topic belongs to the platform stack. It does not exist yet on the very first run; the stacks that
# are deployed before it simply get no alarms until they are deployed again.
ALARM_TOPIC_ARN=""
alarm_topic() {
  if [[ -z "$ALARM_TOPIC_ARN" ]]; then
    ALARM_TOPIC_ARN="$(stack_output "$REGION" "$(stack_name platform)" AlertTopicArn)"
  fi
  printf '%s' "$ALARM_TOPIC_ARN"
}

# Prints one Key=Value parameter override per line. Mode and Version are only passed when asked for, so a
# routine deployment keeps whatever mode and version the stacks already run.
stack_params() {
  local stack="$1" topic
  printf 'Env=%s\n' "$ENV_NAME"
  case "$stack" in
    platform)
      if [[ -n "$ALARM_EMAIL" ]]; then printf 'AlarmEmail=%s\n' "$ALARM_EMAIL"; fi
      ;;
    storage)
      printf 'AppDomain=%s\n' "$APP_DOMAIN"
      ;;
    messaging | database | cache | core | autojudge)
      topic="$(alarm_topic)"
      if [[ -n "$topic" ]]; then printf 'AlarmTopicArn=%s\n' "$topic"; fi
      ;;
  esac
  case "$stack" in
    database | cache | core | autojudge)
      if [[ -n "$MODE" ]]; then printf 'Mode=%s\n' "$MODE"; fi
      ;;
  esac
  case "$stack" in
    core | autojudge)
      if [[ -n "$VERSION" ]]; then printf 'Version=%s\n' "$VERSION"; fi
      ;;
  esac
  case "$stack" in
    core)
      printf 'AppDomain=%s\nApiDomain=%s\nHostedZoneId=%s\n' "$APP_DOMAIN" "$API_DOMAIN" "$HOSTED_ZONE_ID"
      if [[ "$TASKS" == default ]]; then
        printf 'DesiredTasks=\n'
      elif [[ -n "$TASKS" ]]; then
        printf 'DesiredTasks=%s\n' "$TASKS"
      fi
      ;;
    api-edge)
      printf 'ApiDomain=%s\nHostedZoneId=%s\nCloudFrontCertificateArn=%s\n' \
        "$API_DOMAIN" "$HOSTED_ZONE_ID" "$CLOUDFRONT_CERTIFICATE_ARN"
      ;;
    webapp)
      printf 'AppDomain=%s\nHostedZoneId=%s\nCloudFrontCertificateArn=%s\n' \
        "$APP_DOMAIN" "$HOSTED_ZONE_ID" "$CLOUDFRONT_CERTIFICATE_ARN"
      ;;
  esac
}

for stack in "${ENV_STACKS[@]}"; do
  if ! is_selected "$stack"; then
    continue
  fi
  params=()
  while IFS= read -r line; do
    params+=("$line")
  done < <(stack_params "$stack")

  deploy_stack "$(stack_name "$stack")" "$STACKS_DIR/${stack}.yaml" "$REGION" "${params[@]}"

  if [[ "$ENV_NAME" == production && "$DRY_RUN" != true ]]; then
    aws_cli cloudformation update-termination-protection --region "$REGION" \
      --stack-name "$(stack_name "$stack")" --enable-termination-protection > /dev/null
  fi
done

if [[ "$DRY_RUN" != true ]] && is_selected webapp; then
  webapp_stack="$(stack_name webapp)"
  log "values for the webapp build and deployment:"
  printf '  VITE_API_URL=https://%s\n' "$API_DOMAIN"
  printf '  VITE_CLOUDWATCH_RUM_APP_ID=%s\n' "$(stack_output "$REGION" "$webapp_stack" CloudWatchRumAppId)"
  printf '  VITE_CLOUDWATCH_RUM_REGION=%s\n' "$REGION"
  printf '  bucket:       %s\n' "$(stack_output "$REGION" "$webapp_stack" WebAppBucketName)"
  printf '  distribution: %s\n' "$(stack_output "$REGION" "$webapp_stack" WebAppDistributionId)"
fi
