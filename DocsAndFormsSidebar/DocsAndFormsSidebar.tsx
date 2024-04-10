import React, { FC, useState } from 'react';
import { SidebarTitle } from '../../../components/Sidebar/SidebarTitle/SidebarTitle';
import { SidebarArticle } from '../../../components/Sidebar/SidebarArticle/SidebarArticle';
import { useTranslationsContext } from '../../../context';
import { Sidebar } from '../../../components/Sidebar/Sidebar';
import { useDocumentByIdQuery } from '../../../hooks/data/documents/useDocumentByIdQuery';
import { useDocumentProcessesQuery } from '../../../hooks/data/documents/useDocumentProcessesQuery';
import { useDocumentRolesQuery } from '../../../hooks/data/documents/useDocumentRolesQuery';
import styles from './DocsAndFormsSidebar.module.css';
import tableStyles from '../DocsAndFormsTable/DocsAndFormsTable.module.css';
import { Tabs } from '../../../components/Tabs/Tabs';
import { DocsAndFormsSidebarFooter } from './DocsAndFormsSidebarFooter';
import { Table } from '../../../components/table/Table';
import { TableHead } from '../../../components/table/TableHead';
import { TableRow } from '../../../components/table/TableRow';
import { TableCell } from '../../../components/table/TableCell';
import { TableBody } from '../../../components/table/TableBody';

interface DocsAndFormsSidebarProps {
  documentId: string | null;
  open: boolean;
  onClose: () => void;
}

export const DocsAndFormsSidebar: FC<DocsAndFormsSidebarProps> = ({
  documentId,
  open,
  onClose,
}) => {
  const { t } = useTranslationsContext();

  const tabButtons = [
    { value: '0', label: t('D_SIDEBAR_TAB_PROCESSES') },
    { value: '1', label: t('D_SIDEBAR_TAB_ROLES') },
  ];

  const [activeTab, setActiveTab] = useState(tabButtons[0].value);

  const { data: documentData, isLoading: documentLoading } =
    useDocumentByIdQuery(documentId || '', {
      enabled: !!documentId,
    });

  const { data: documentProcessesData, isLoading: documentProcessesLoading } =
    useDocumentProcessesQuery(documentId || '', {
      enabled: !!documentId,
    });

  const { data: documentRolesData, isLoading: documentRolesLoading } =
    useDocumentRolesQuery(documentId || '', {
      enabled: !!documentId,
    });

  return (
    <Sidebar open={open} onClose={onClose}>
      {!documentLoading && (
        <SidebarTitle
          title={t('DOCUMENT_LABEL_SIDEBAR')}
          time={`${t('DOCUMENT_LABEL_LAST_CHANGE')}: ${
            documentData?.updatedAt
              ? documentData.updatedAt
              : documentData?.createdAt
          }`}
        />
      )}

      <div className={styles.sideBarTabs}>
        <Tabs
          buttons={tabButtons}
          handleChange={(value: string) => {
            setActiveTab(value);
          }}
          value={activeTab}
        />
      </div>

      {!documentLoading && (
        <div className={styles.documentName}>
          <SidebarArticle
            label={t('DOCUMENT_LABEL_NAME')}
            value={documentData?.name}
          />
        </div>
      )}

      {!documentProcessesLoading &&
        documentProcessesData?.length !== 0 &&
        activeTab === '0' && (
          <>
            <Table style={{ minWidth: '350px' }} className={tableStyles.table}>
              <TableHead>
                <TableRow>
                  <TableCell>{'ID'}</TableCell>
                  <TableCell>{t('DOCUMENT_LABEL_NAME')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {documentProcessesData?.map((process) => {
                  return (
                    <TableRow key={process.id} hover={true}>
                      <TableCell>
                        <div>{process.id}</div>
                      </TableCell>
                      <TableCell>
                        <div>{process.name}</div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </>
        )}

      {!documentRolesLoading &&
        documentRolesData?.length !== 0 &&
        activeTab === '1' && (
          <>
            <Table style={{ minWidth: '350px' }} className={tableStyles.table}>
              <TableHead>
                <TableRow>
                  <TableCell>{t('DOCUMENT_LABEL_NAME')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {documentRolesData?.map((role) => {
                  return (
                    <TableRow key={role.id} hover={true}>
                      <TableCell>
                        <div>{role.name}</div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </>
        )}
      {documentData && <DocsAndFormsSidebarFooter document={documentData} />}
    </Sidebar>
  );
};
