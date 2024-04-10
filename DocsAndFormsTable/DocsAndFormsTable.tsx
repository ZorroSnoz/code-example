import classNames from 'classnames';
import React, { FC } from 'react';
import { useTranslationsContext } from '../../../context';
import { DocumentModel } from '../../../models/DocumentModel';
import styles from './DocsAndFormsTable.module.css';
import DownloadIcon from '../../../icons/Download';
import ExternalLinkIcon from '../../../icons/ExternalLink';
import { downloadFile } from '../../../helpers/file';
import { Table } from '../../../components/table/Table';
import { TableBody } from '../../../components/table/TableBody';
import { TableCell } from '../../../components/table/TableCell';
import { TableHead } from '../../../components/table/TableHead';
import { TableRow } from '../../../components/table/TableRow';
import IconButton from '@mui/material/IconButton';

interface DocumentsTableProps {
  onChangeOrderBy?: (field: string) => void;
  orderBy?: string;

  items: DocumentModel[];
  onSelectItem?: (roleId: DocumentModel['id']) => void;
  selectedItemId?: DocumentModel['id'];
  onEditItem?: (roleId: DocumentModel['id']) => void;
}

export const DocsAndFormsTable: FC<DocumentsTableProps> = (props) => {
  const { t } = useTranslationsContext();

  const handleDownloadFile = (downloadLink, downloadName) => {
    downloadFile(downloadLink, downloadName);
  };

  return (
    <div className={styles.wrapper}>
      <Table className={styles.table}>
        <TableHead>
          <TableRow>
            <TableCell
              className={classNames({
                [styles.selectedHead]: props.orderBy === 'Document.id',
                [styles.sortableHead]: true,
              })}
              onClick={() => props.onChangeOrderBy?.('Document.id')}
            >
              ID
            </TableCell>
            <TableCell
              className={classNames({
                [styles.selectedHead]: props.orderBy === 'Document.name',
                [styles.sortableHead]: true,
              })}
              onClick={() => props.onChangeOrderBy?.('Document.name')}
            >
              {t('DOCUMENT_LABEL_NAME')}
            </TableCell>
            <TableCell>{t('DOCUMENT_LABEL_CATEGORY')}</TableCell>
            <TableCell>{t('DOCUMENT_LABEL_STATUS')}</TableCell>
            <TableCell>{t('DOCUMENT_LABEL_LINK')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.items.map((document) => {
            return (
              <TableRow
                key={document.id}
                hover={true}
                className={classNames({
                  [styles.selectedRow]: props.selectedItemId === document.id,
                })}
                onDoubleClick={() => {
                  props.onSelectItem?.(document.id);
                  props.onEditItem?.(document.id);
                }}
                onClick={() => {
                  props.onSelectItem?.(document.id);
                }}
              >
                <TableCell>
                  <div>{document.id}</div>
                </TableCell>
                <TableCell>
                  <div>{document.name}</div>
                </TableCell>
                <TableCell>
                  <div>{document.category.index}</div>
                </TableCell>
                <TableCell>
                  <div>
                    {document.status === 0 && t('DOCUMENT_LABEL_INACTIVE')}
                    {document.status === 1 && t('DOCUMENT_LABEL_ACTIVE')}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    {document.fileRecord && (
                      <IconButton
                        size="small"
                        onClick={() => {
                          handleDownloadFile(
                            document.fileRecord.downloadLink,
                            document.name
                          );
                        }}
                        className={styles.downloadButton}
                      >
                        <DownloadIcon />
                      </IconButton>
                    )}
                    {document.type !== 'empty' && (
                      <a
                        href={
                          document.fileRecord
                            ? document.fileRecord.downloadLink
                            : document.link
                        }
                        target={'_blank'}
                      >
                        <IconButton
                          size="small"
                          className={styles.downloadButton}
                        >
                          <ExternalLinkIcon />
                        </IconButton>
                      </a>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
