const DEFAULT_FILE_NAME = 'reporte.pdf';

function getFileNameFromContentDisposition(contentDisposition: string | null): string {
  if (!contentDisposition) {
    return DEFAULT_FILE_NAME;
  }

  const fileNameMatch = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(contentDisposition);
  const fileName = fileNameMatch?.[1] ?? fileNameMatch?.[2];

  if (!fileName) {
    return DEFAULT_FILE_NAME;
  }

  return decodeURIComponent(fileName.trim());
}

export function downloadPdfBlob(blob: Blob, contentDisposition: string | null): void {
  const fileName = getFileNameFromContentDisposition(contentDisposition);
  const blobUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = blobUrl;
  anchor.download = fileName;
  anchor.click();

  window.URL.revokeObjectURL(blobUrl);
}
