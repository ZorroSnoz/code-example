import React, { FC } from 'react';
import styles from './DocsAndFormsSidebar.module.css';
import { SecondaryButton } from '../../../components/Button';
import DownloadIcon from '../../../icons/Download';
import ExternalLinkIcon from '../../../icons/ExternalLink';
import { DocumentModel } from '../../../models/DocumentModel';
import { downloadFile } from '../../../helpers/file';

type DocsAndFormsSidebarFooterPropsType = {
  document: DocumentModel;
};

export const DocsAndFormsSidebarFooter: FC<
  DocsAndFormsSidebarFooterPropsType
> = ({ document }) => {
  const handleDownloadFile = () => {
    downloadFile(document.fileRecord?.downloadLink, document.name);
  };

  const href = document.fileRecord
    ? document.fileRecord.downloadLink
    : document.link
    ? document.link
    : '';

  return (
    <div className={styles.footer}>
      {document.fileRecord && (
        <SecondaryButton onClick={handleDownloadFile}>
          Download
          <DownloadIcon />
        </SecondaryButton>
      )}

      {document.type !== 'empty' && (
        <a href={href} target={'_blank'}>
          <SecondaryButton>
            Open in Browser
            <ExternalLinkIcon />
          </SecondaryButton>
        </a>
      )}
    </div>
  );
};
