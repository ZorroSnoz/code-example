import React, { FC, useState } from 'react';
import { ModalView } from '../../../components/Dialog/ModalView';
import { DocsAndFormsGeneralForm } from './DocsAndFormsGeneralForm/DocsAndFormsGeneralForm';
import { useTranslationsContext } from '../../../context';
import DialogContent from '../../../components/Dialog/DialogContent';
import { useDocumentByIdQuery } from '../../../hooks/data/documents/useDocumentByIdQuery';

interface DocsAndFormsModalProps {
  documentId?: string | undefined;
  onClose?: () => void;
}

export const DocsAndFormsModal: FC<DocsAndFormsModalProps> = (props) => {
  const { t } = useTranslationsContext();
  const [activeTab, setActiveTab] = useState(0);
  const tabButtons = [
    { value: '0', label: t('UPLOAD_DOCUMENT_LABEL_GENERAL') },
    { value: '1', label: t('UPLOAD_DOCUMENT_LABEL_STATUS') },
  ];

  const { documentId, onClose } = props;

  const { data: documentData, isLoading: documentLoading } =
    useDocumentByIdQuery(documentId || '', {
      enabled: !!documentId,
    });

  const title = documentData?.name || t('UPLOAD_DOCUMENT_LABEL');

  return (
    <ModalView
      open={true}
      title={t('Doc/Form')}
      content={
        <DialogContent
          setActiveTab={setActiveTab}
          tabButtons={tabButtons}
          itemName={title}
        >
          {activeTab === 0 && (
            <DocsAndFormsGeneralForm
              {...{
                documentId,
                onClose,
                documentData,
                documentLoading,
              }}
            />
          )}
        </DialogContent>
      }
    />
  );
};
