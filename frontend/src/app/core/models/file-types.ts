export interface AcceptFileType {
    acceptAlias: string; 
    mimeType: string;
}

export const ALLOWED_FILE_TYPES_MAP: AcceptFileType[] = [
    // Images
    { acceptAlias: '.jpg', mimeType: 'image/jpeg' },
    { acceptAlias: '.jpeg', mimeType: 'image/jpeg' },
    { acceptAlias: '.png', mimeType: 'image/png' },
    { acceptAlias: 'image/*', mimeType: 'image/' },

    // Documents
    { acceptAlias: '.pdf', mimeType: 'application/pdf' },
    { acceptAlias: '.doc', mimeType: 'application/msword' },
    { acceptAlias: '.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
];
  

export const ALLOWED_ACCEPT_STRING: string = ALLOWED_FILE_TYPES_MAP
    .map(type => type.acceptAlias)
    .join(',');