import type { ReactNode, RefObject } from "react";
import type { AuthProviderType } from "~/types/auth";
import type { ResumeListItem, ResumeUploadState } from "~/types/resume";

export type OAuthButtonProps = Readonly<{
  provider: AuthProviderType;
  label: string;
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}>;

export type DashboardUploadSectionProps = Readonly<{
  onOpenPicker: () => void;
  onFilePicked: (file: File | null) => void;
  onSubmitUpload: () => void;
  onCancelUpload: () => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  selectedFile: File | null;
  maxFileSizeBytes: number;
  validationError: string | null;
  uploadError: string | null;
  uploadState: ResumeUploadState;
  uploadProgress: number;
}>;

export type ResumeListCardProps = Readonly<{
  resumes: Array<ResumeListItem>;
  isLoading: boolean;
  loadError: string | null;
}>;

export type QuickActionsCardProps = Readonly<{
  onUpload: () => void;
}>;

export type NotFoundProps = Readonly<{
  children?: ReactNode;
}>;

export type NavLinkProps = Readonly<{
  to: string;
  label: string;
  exact?: boolean;
}>;

export type SpinnerIconProps = {
  ariaLabel: string;
  className?: string;
};
