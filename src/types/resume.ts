import { ResumeFileTypeEnum, ResumeUploadStateEnum } from "~/enums/resume";

export type ResumeFileType = ResumeFileTypeEnum.PDF | ResumeFileTypeEnum.DOCX;

export type ResumeUploadState =
  | ResumeUploadStateEnum.IDLE
  | ResumeUploadStateEnum.UPLOADING
  | ResumeUploadStateEnum.SAVING
  | ResumeUploadStateEnum.SUCCESS
  | ResumeUploadStateEnum.FAILED;

export type ResumeListItem = {
  id: string;
  original_filename: string;
  created_at: string | null;
};

export type ResumeRecord = {
  id: string;
  original_filename: string;
  created_at: string | null;
};

export type ResumeAnalysisRecord = {
  id: string;
  overall_score: number | null;
  created_at: string | null;
};

export type ResumeInsertRecord = {
  id: string;
  user_id: string;
  original_filename: string;
  file_type: ResumeFileType;
  storage_path: string;
  title: string;
};
