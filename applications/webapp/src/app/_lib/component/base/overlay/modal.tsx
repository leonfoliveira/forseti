import * as HeroUI from "@heroui/react";
import React from "react";

export type ModalProps = React.ComponentProps<typeof HeroUI.Modal>;

/**
 * Display a modal component.
 */
export function Modal(props: ModalProps) {
  return <HeroUI.Modal {...props} />;
}

export type ModalContentProps = React.ComponentProps<
  typeof HeroUI.ModalContent
>;

/**
 * Display modal content wrapper.
 */
Modal.Content = function ModalContent(props: ModalContentProps) {
  return <HeroUI.ModalContent {...props} />;
};

export type ModalHeaderProps = React.ComponentProps<typeof HeroUI.ModalHeader>;

/**
 * Display modal header.
 */
Modal.Header = function ModalHeader(props: ModalHeaderProps) {
  return <HeroUI.ModalHeader {...props} />;
};

export type ModalBodyProps = React.ComponentProps<typeof HeroUI.ModalBody>;

/**
 * Display modal body.
 */
Modal.Body = function ModalBody(props: ModalBodyProps) {
  return <HeroUI.ModalBody {...props} />;
};

export type ModalFooterProps = React.ComponentProps<typeof HeroUI.ModalFooter>;

/**
 * Display modal footer.
 */
Modal.Footer = function ModalFooter(props: ModalFooterProps) {
  return <HeroUI.ModalFooter {...props} />;
};
