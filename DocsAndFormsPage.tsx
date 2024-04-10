import React, { useCallback, useEffect, useState } from 'react';
import { useGlobalErrorsContext, useTranslationsContext } from '../../context';
import { CircularProgress, Typography } from '@mui/material';
import styles from './DocsAndFormsPage.module.css';
import routes from '../../router/routes';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { ActionButtons } from '../../components/ActionButtons';
import { useSearchDocumentsQuery } from '../../hooks/data/documents/useSearchDocumentsQuery';
import { SelectCompanies } from '../../components/Form/SelectWithData/SelectCompanies/SelectCompanies';
import { SelectOptions } from '../../components/Form/SelectWithData/SelectOptions/SelectOptions';
import { DocsAndFormsTable } from './DocsAndFormsTable/DocsAndFormsTable';
import {
  pageSizeButtons,
  PageSizeButtons,
} from '../../components/PageSizeButtons/PageSizeButtons';
import useModalWithData from '../../hooks/useModalWithData';
import { DocsAndFormsModal } from './DocsAndFormsModal/DocsAndFormsModal';
import { DocsAndFormsSidebar } from './DocsAndFormsSidebar/DocsAndFormsSidebar';
import { useDeleteDocumentMutation } from '../../hooks/data/documents/useDeleteDocumentMutation';
import { ConfirmationModal } from '../../components/Dialog/ConfirmationModal/ConfirmationModal';

export const DocsAndFormsPage = () => {
  const { t } = useTranslationsContext();
  const { addGlobalError } = useGlobalErrorsContext();

  const {
    params: { documentId },
  } = useRouteMatch<{ documentId: string }>();
  const history = useHistory();

  const [openSideBar, setOpenSideBar] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (selectedDocumentId) {
      setOpenSideBar(true);
    } else {
      setOpenSideBar(false);
    }
  }, [selectedDocumentId]);

  const [documentsSearchParams, setDocumentsSearchParams] = useState({
    pageSize: pageSizeButtons[0].value,
    pageNumber: 1,
    orderDirection: 'DESC',
    orderBy: 'Document.name',
    companyId: '',
    categoryId: '',
  });

  const { data: documentsData, isLoading: documentsLoading } =
    useSearchDocumentsQuery(documentsSearchParams, {
      keepPreviousData: true,
    });

  const { mutateAsync: deleteDocument } = useDeleteDocumentMutation();

  const [showDeleteDocumentModal, hideDeleteDocumentModal] = useModalWithData(
    (documentId: string) => {
      return () => (
        <ConfirmationModal
          title={t('DOCUMENTS_DELETE_DOCUMENT_TITLE')}
          onCancelClick={hideDeleteDocumentModal}
          onSubmitClick={async () => {
            try {
              await deleteDocument(documentId);
              setSelectedDocumentId(null);
            } catch (err) {
              addGlobalError(err);
            } finally {
              hideDeleteDocumentModal();
            }
          }}
          mainText={t('DOCUMENTS_DELETE_DIALOG_TEXT')}
          warning={{
            text: t('DOCUMENTS_DELETE_DIALOG_WARNING'),
            type: 'warning',
          }}
          applyButton={t('DELETE_DIALOG_APPLY')}
          cancelButton={t('DELETE_DIALOG_CANCEL')}
        />
      );
    }
  );

  const handleOnChangeOrderBy = useCallback((orderBy: string) => {
    setDocumentsSearchParams((current) => {
      if (current.orderBy === orderBy) {
        return {
          ...current,
          orderDirection: current.orderDirection === 'ASC' ? 'DESC' : 'ASC',
        };
      }

      return {
        ...current,
        orderBy,
        orderDirection: 'DESC',
      };
    });
  }, []);

  const [showDocumentModal, hideDocumentModal] = useModalWithData(
    (documentId?: string) => {
      return () => (
        <DocsAndFormsModal
          documentId={documentId}
          onClose={() => {
            hideDocumentModal(routes.documents());
          }}
        />
      );
    }
  );

  useEffect(() => {
    if (documentId) {
      showDocumentModal(documentId);
    }
  }, [documentId, showDocumentModal]);

  const handleOnEdit = useCallback(
    (documentId: string) => {
      history.push(`${routes.documents()}/${documentId}`);
    },
    [history]
  );

  return (
    <div>
      <Typography variant="h1">{t('LABEL_DOCS_AND_FORMS')}</Typography>

      <div className={styles.root}>
        <div className={styles.filterSelect}>
          <SelectCompanies
            value={'0'}
            label={t('FILTERS_COMPANY')}
            startOption={{ value: '0', label: t('FILTERS_SELECT_ALL') }}
            size="small"
            onChangeValue={(companyId) => {
              const newSearch = { ...documentsSearchParams };
              newSearch.companyId = companyId;
              setDocumentsSearchParams(newSearch);
            }}
          />
        </div>
        <div className={styles.filterSelect}>
          <SelectOptions
            label={t('FILTERS_CATEGORY')}
            value={'0'}
            startOption={{ value: '0', label: t('FILTERS_SELECT_ALL') }}
            group="document_category"
            withActions={false}
            size="small"
            onChangeValue={(categoryId) => {
              const newSearch = { ...documentsSearchParams };
              newSearch.categoryId = categoryId;
              setDocumentsSearchParams(newSearch);
            }}
          />
        </div>
        <PageSizeButtons
          className={styles.pageSizeButtons}
          label={t('FILTERS_SHOW')}
          value={documentsSearchParams.pageSize}
          onChange={(pageSize) => {
            setDocumentsSearchParams((current) => ({
              ...current,
              pageSize,
            }));
          }}
        />

        <ActionButtons
          selectedItem={selectedDocumentId}
          disabled={documentsLoading}
          onEditClick={handleOnEdit}
          onDeleteClick={showDeleteDocumentModal}
          onAddNewClick={() => {
            showDocumentModal();
          }}
        />
      </div>
      {documentsData ? (
        <DocsAndFormsTable
          items={documentsData?.records}
          selectedItemId={selectedDocumentId || undefined}
          onChangeOrderBy={handleOnChangeOrderBy}
          onEditItem={handleOnEdit}
          orderBy={documentsSearchParams.orderBy}
          onSelectItem={setSelectedDocumentId}
        />
      ) : (
        <CircularProgress />
      )}

      <DocsAndFormsSidebar
        documentId={selectedDocumentId}
        open={openSideBar}
        onClose={() => {
          setOpenSideBar(!openSideBar);
        }}
      />
    </div>
  );
};
