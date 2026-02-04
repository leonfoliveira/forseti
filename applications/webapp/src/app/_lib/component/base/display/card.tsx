import * as HeroUI from "@heroui/react";
import React from "react";

export type CardProps = React.ComponentProps<typeof HeroUI.Card>;

/**
 * Display a card component.
 */
export function Card(props: CardProps) {
  return <HeroUI.Card {...props} />;
}

export type CardHeaderProps = React.ComponentProps<typeof HeroUI.CardHeader>;

/**
 * Display card header.
 */
Card.Header = function CardHeader(props: CardHeaderProps) {
  return <HeroUI.CardHeader {...props} />;
};

export type CardBodyProps = React.ComponentProps<typeof HeroUI.CardBody>;

/**
 * Display card body.
 */
Card.Body = function CardBody(props: CardBodyProps) {
  return <HeroUI.CardBody {...props} />;
};

export type CardFooterProps = React.ComponentProps<typeof HeroUI.CardFooter>;

/**
 * Display card footer.
 */
Card.Footer = function CardFooter(props: CardFooterProps) {
  return <HeroUI.CardFooter {...props} />;
};
