export interface FileDialogOptions {
  title?: string;
  defaultPath?: string;
  buttonLabel?: string;
  filters?: Array<{
    name: string;
    extensions: string[];
  }>;
  properties?: string[];
  message?: string;
}

export interface FileDialogResult {
  canceled: boolean;
  filePaths: string[];
  filePath?: string;
}

export interface ElectronFiles {
  open: (options: FileDialogOptions) => Promise<FileDialogResult | null>;
  save: (options: FileDialogOptions) => Promise<FileDialogResult | null>;
}
