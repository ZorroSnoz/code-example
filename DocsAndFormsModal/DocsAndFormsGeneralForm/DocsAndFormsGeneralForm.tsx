import { useFormik } from 'formik';
import React, { FC, useCallback, useEffect, useState } from 'react';
import * as yup from 'yup';

import DialogActionButtons from '../../../../components/Dialog/ActionButtons/DialogActionButtons';
import TextField from '../../../../components/Form/TextField';
import { FieldLabel } from '../../../../components/Form/TextField/FieldLabel';
import CircularLoader from '../../../../components/Loader/CircularLoader';
import { RTEControlled } from '../../../../components/Form/RTE/RTEControlled';
import { DocumentModel } from '../../../../models/DocumentModel';
import styles from '../DocsAndFormsModal.module.css';
import { SelectDocumentsCategorySimple } from '../../../../components/Form/SelectWithData/SelectDocumentsCategorySimple/SelectDocumentsCategorySimple';
import { SelectCompaniesSimple } from '../../../../components/Form/SelectWithData/SelectCompanies/SelectCompaniesSimple';
import ToggleSwitchWithLabel from '../../../../components/Form/ToggleSwitchWithLabel';
import { FileUpload } from '../../../../components/Form/FileUpload/FileUpload';
import { useEditDocumentMutation } from '../../../../hooks/data/documents/useEditDocumentMutation';
import { useCreateDocumentMutation } from '../../../../hooks/data/documents/useCreateDocumentMutation';
import SelectFunctionGroups from '../../../../components/Form/SelectWithData/SelectFunctionGroups';
import { useTranslationsContext } from '../../../../context';
import { CreateDocumentPayload } from '../../../../api/documentsAndForms';
import DialogActions from '@mui/material/DialogActions';

const validationSchema = yup
  .object()
  .shape({
    name: yup.string().required('Required'),
    categoryValueId: yup.string().required('Required'),
    companyId: yup.string().required('Required'),
    link: yup.string().nullable(),
    fileId: yup.string().nullable(),
  })
  .test('linkOrFileId', 'Either link or fileId is required', function (values) {
    const { link, fileId } = values;
    const isLinkValid = link && link.trim() !== '';
    const isFileIdValid = fileId && fileId.trim() !== '';
    return isLinkValid || isFileIdValid;
  });

interface DocsAndFormsGeneralFormProps {
  documentId?: string | undefined;
  onClose?: () => void;
  documentLoading: boolean;
  documentData: DocumentModel;
}

export const DocsAndFormsGeneralForm: FC<DocsAndFormsGeneralFormProps> = (
  props
) => {
  const { t } = useTranslationsContext();

  const { documentData, documentLoading, documentId, onClose } = props;

  const [isFile, setIsFile] = useState(documentData?.type !== 'link');

  // if the document data has been uploaded, need to update the state to show the current file type
  useEffect(() => {
    setIsFile(documentData?.type !== 'link');
  }, [documentData]);

  const { mutateAsync: createDocument, isLoading: createDocumentLoading } =
    useCreateDocumentMutation();
  const { mutateAsync: editDocument, isLoading: editDocumentLoading } =
    useEditDocumentMutation();

  const { values, handleSubmit, handleChange, errors, dirty, setFieldValue } =
    useFormik<{
      name: string;
      categoryValueId: string;
      companyId: string;
      description: string;
      fileId: string | null;
      link: string | null;
    }>({
      initialValues: {
        name: documentData?.name || '',
        categoryValueId: documentData?.category?.id
          ? documentData?.category?.id
          : '',
        companyId: documentData?.company?.id ? documentData?.company?.id : '',
        description: documentData?.description || '',
        fileId: documentData?.fileRecord?.id || '',
        link: documentData?.link || '',
        documentEditorFunctionGroupId: documentData?.documentEditor?.id || null,
        responsibleManagerFunctionGroupId:
          documentData?.responsibleManager?.id || null,
      },
      validationSchema,
      validateOnBlur: true,
      validateOnChange: false,
      enableReinitialize: true,
      onSubmit: async (validatedValues) => {
        const newValidatedValues: CreateDocumentPayload = {};
        Object.keys(validatedValues).forEach((key) => {
          if (validatedValues[key] !== '') {
            newValidatedValues[key] = validatedValues[key];
          }
        });

        if (documentId) {
          try {
            await editDocument({
              documentId: documentId,
              ...newValidatedValues,
            });
            props.onClose?.();
          } catch (error) {
            console.error('Error while editing the document:', error);
            props.onClose?.();
          }
        } else {
          try {
            await createDocument(newValidatedValues);
            props.onClose?.();
          } catch (error) {
            console.error('Error while creating the document:', error);
            props.onClose?.();
          }
        }
      },
    });

  const handleOnSelectCategory = useCallback(
    (categoryValueId: string) => {
      setFieldValue('categoryValueId', categoryValueId);
    },
    [setFieldValue]
  );

  const handleOnSelectCompany = useCallback(
    (companyId: string) => {
      setFieldValue('companyId', companyId);
    },
    [setFieldValue]
  );

  const handleOnChangeDescription = useCallback(
    (value: string) => {
      setFieldValue('description', value);
    },
    [setFieldValue]
  );

  const handleOnSwitchFileType = useCallback(
    (isFile: boolean) => {
      setIsFile(isFile);
      if (isFile) {
        setFieldValue('link', '');
      } else {
        setFieldValue('fileId', '');
      }
    },
    [setFieldValue]
  );

  const handleOnChangeFile = useCallback(
    (value: string) => {
      setFieldValue('fileId', value);
      setFieldValue('link', '');
    },
    [setFieldValue]
  );

  const handleOnChangeDocumentEditor = useCallback(
    (value: string) => {
      setFieldValue('documentEditorFunctionGroupId', value);
    },
    [setFieldValue]
  );

  const handleOnChangeResponsibleManager = useCallback(
    (value: string) => {
      setFieldValue('responsibleManagerFunctionGroupId', value);
    },
    [setFieldValue]
  );

  const fileData = documentData?.fileRecord
    ? {
        ...documentData.fileRecord,
        name: documentData?.name,
      }
    : null;

  return (
    <>
      {documentId && documentLoading ? (
        <CircularLoader show={true} />
      ) : (
        <form
          className={styles.form}
          onSubmit={handleSubmit}
          noValidate
          autoComplete="off"
        >
          <div className={styles.formRow}>
            <TextField
              label={'DOCUMENTS_LABEL_NAME'}
              labelRequired={true}
              name="name"
              value={values.name}
              onChange={handleChange}
              error={!!errors.name}
            />
          </div>
          {documentData && (
            <div className={styles.formRow}>
              <FieldLabel label={'ID'} required={false}>
                <p className={styles.idDocumentText}>{documentData.id}</p>
              </FieldLabel>
            </div>
          )}
          <div className={styles.formRow}>
            <FieldLabel label={'DOCUMENTS_LABEL_CATEGORY'} required={true}>
              <SelectDocumentsCategorySimple
                selectedItemId={values.categoryValueId}
                onChangeSelectedItemId={handleOnSelectCategory}
                error={!!errors.categoryValueId}
                initSelectedItem={documentData?.category}
              />
            </FieldLabel>
          </div>
          <div className={styles.formRow}>
            <FieldLabel label={'DOCUMENTS_LABEL_COMPANY'} required={true}>
              <SelectCompaniesSimple
                selectedItemId={values.companyId}
                onChangeSelectedItemId={handleOnSelectCompany}
                error={!!errors.companyId}
                initSelectedItem={documentData?.company}
              />
            </FieldLabel>
          </div>
          <div className={styles.formRow}>
            <FieldLabel label={'DOCUMENTS_LABEL_DESCRIPTION'}>
              <RTEControlled
                id={'info'}
                initialValue={documentData?.description || ''}
                onChange={handleOnChangeDescription}
                error={!!(errors as any).description}
                helperText={'helper text'}
              />
            </FieldLabel>
          </div>
          <div className={styles.formRow}>
            <FieldLabel label={'NA'}>
              <ToggleSwitchWithLabel
                labelKey={'Lorem ipsum'}
                value={isFile}
                handleChange={() => {
                  handleOnSwitchFileType(!isFile);
                }}
              />
            </FieldLabel>
          </div>
          <div className={styles.formRow}>
            {isFile ? (
              <FieldLabel required={true} label={'DOCUMENTS_LABEL_TYPE'}>
                <FileUpload
                  initialFileData={fileData}
                  onSelectFile={handleOnChangeFile}
                />
              </FieldLabel>
            ) : (
              <TextField
                label={'DOCUMENTS_LABEL_TYPE'}
                labelRequired={true}
                name="link"
                value={values.link}
                onChange={handleChange}
                error={!!errors.link}
              />
            )}
          </div>
          <div className={styles.formRow}>
            <FieldLabel label={'DOCUMENTS_LABEL_DOCUMENT_EDITOR'}>
              <SelectFunctionGroups
                name="documentEditorFunctionGroupId"
                type="select"
                searchQuery={`pageNumber=1&withRoles[]=ROLE_DOCUMENT_EDITOR&orderBy=FunctionGroup.name&orderDirection=ASC`}
                startOption={{
                  value: null,
                  label: t('NA'),
                }}
                onChangeValue={handleOnChangeDocumentEditor}
                fullWidth={true}
                value={values.documentEditorFunctionGroupId}
              />
            </FieldLabel>
          </div>

          <div className={styles.formRow}>
            <FieldLabel label={'DOCUMENTS_LABEL_RESPONSIBLE_MANAGER'}>
              <SelectFunctionGroups
                name="responsibleManagerFunctionGroupId"
                type="select"
                searchQuery={`pageNumber=1&withRoles[]=ROLE_RESPONSIBLE_MANAGER&orderBy=FunctionGroup.name&orderDirection=ASC`}
                startOption={{
                  value: null,
                  label: t('NA'),
                }}
                onChangeValue={handleOnChangeResponsibleManager}
                fullWidth={true}
                value={values.responsibleManagerFunctionGroupId}
              />
            </FieldLabel>
          </div>
          <input type="submit" hidden={true} />
        </form>
      )}

      <DialogActions className={styles.actions}>
        <DialogActionButtons
          onClose={onClose}
          onSubmit={handleSubmit}
          loading={createDocumentLoading || editDocumentLoading}
          closeWithConfirmation={dirty}
        />
      </DialogActions>
    </>
  );
};
