import {
  Alert,
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  FormControl,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { FormikHelpers, useFormik } from 'formik';
import { useAtom } from 'jotai';
import { useCallback, useEffect, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { NETWORKS } from '../../constants/chain';
import { useTokenData } from '../../hooks/blockchain';
import { AppDialogTitle } from '../AppDialogTitle';

import * as Yup from 'yup';

import { useWeb3React } from '@web3-react/core';
import { AxiosError } from 'axios';
import { ethers } from 'ethers';
import { useSnackbar } from 'notistack';
import { useDebounce } from '../../hooks/misc';
import { tokensAtom } from '../../state/atoms';
import { Network } from '../../types/chains';
import { isAddressEqual } from '../../utils/blockchain';
import { ipfsUriToUrl } from '../../utils/ipfs';

interface Props {
  dialogProps: DialogProps;
}

interface Form {
  chainId: number;
  contractAddress: string;
  name: string;
  symbol: string;
  decimals: number;
}

function ImportTokenDialog({ dialogProps }: Props) {
  const intl = useIntl();
  const { onClose } = dialogProps;
  const { chainId } = useWeb3React();

  const [tokens, setTokens] = useAtom(tokensAtom);

  const { enqueueSnackbar } = useSnackbar();

  const FormSchema = useMemo(() => Yup.object().shape({
    chainId: Yup.number().required(),
    contractAddress: Yup.string()
      .test('address', (value) => {
        return value !== undefined ? ethers.utils.isAddress(value) : true;
      })
      .required(),

    name: Yup.string().required(),
    symbol: Yup.string().required(),
    decimals: Yup.number().required(),
  }), []);

  const handleSubmit = useCallback(
    (values: Form, formikHelpers: FormikHelpers<Form>) => {
      const token = tokens.find(
        (t) =>
          t.chainId === values.chainId &&
          isAddressEqual(values.contractAddress, t.address)
      );

      if (!token) {
        setTokens((value) => [
          ...value,
          {
            address: values.contractAddress.toLowerCase(),
            chainId: values.chainId,
            decimals: values.decimals || 0,
            logoURI: '',
            name: values.name || '',
            symbol: values.symbol || '',
          },
        ]);

        enqueueSnackbar(
          intl.formatMessage({
            defaultMessage: 'Token added',
            id: 'token.added',
          }),
          {
            variant: 'success',
            anchorOrigin: {
              vertical: 'bottom',
              horizontal: 'right',
            },
          }
        );
      }

      formikHelpers.resetForm();

      if (onClose) {
        onClose({}, 'escapeKeyDown');
      }
    },
    [tokens, setTokens, enqueueSnackbar, onClose, intl]
  );

  const formik = useFormik<Form>({
    initialValues: {
      chainId: chainId || 1,
      contractAddress: '',
      name: '',
      decimals: 0,
      symbol: '',
    },
    validationSchema: FormSchema,
    onSubmit: handleSubmit,
  });

  useEffect(() => {
    if (chainId !== undefined && chainId !== formik.values.chainId) {
      formik.setFieldValue('chainId', chainId);
    }
  }, [chainId, formik.values.chainId]);

  const lazyAddress = useDebounce<string>(formik.values.contractAddress, 500);

  const onTokenDataSuccess = useCallback(({
    decimals,
    name,
    symbol,
  }: {
    decimals: number;
    name: string;
    symbol: string;
  }) => {
    formik.setValues(
      (value) => ({
        ...value,
        name: name || '',
        decimals: decimals || 0,
        symbol: symbol || '',
      }),
      true
    );
  }, [formik]);

  const tokenData = useTokenData({
    onSuccess: onTokenDataSuccess,
    onError: (err: AxiosError) => {
      formik.setFieldValue('name', '');
      formik.setFieldValue('decimals', 0);
      formik.setFieldValue('symbol', '');
    },
  });

  const { handleChange, values, setFieldError } = formik;

  const handleAddressChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const address = event.target.value;
    handleChange(event);

    if (address && ethers.utils.isAddress(address)) {
      const token = tokens.find(
        (t) =>
          t.chainId === values.chainId &&
          isAddressEqual(address, t.address)
      );

      if (token) {
        setFieldError(
          'contractAddress',
          intl.formatMessage({
            id: 'token.already.imported',
            defaultMessage: 'Token already imported',
          })
        );
      } else {
        tokenData.mutate({
          chainId: values.chainId,
          address,
        });
      }
    }
  }, [handleChange, values.chainId, setFieldError, tokens, intl, tokenData]);

  const handleSubmitForm = () => {
    formik.submitForm();
  };

  const handleClose = useCallback(() => {
    if (onClose) {
      onClose({}, 'backdropClick');
    }
    formik.resetForm();
  }, [onClose, formik]);

  const handleCloseError = useCallback(() => tokenData.reset(), [tokenData]);

  return (
    <Dialog {...dialogProps}>
      <AppDialogTitle
        title={intl.formatMessage({
          id: "import.token",
          defaultMessage: "Import Token",
          description: "Import token dialog title"
        })}
        onClose={handleClose}
      />
      <DialogContent dividers>
        <Stack spacing={2}>
          {tokenData.isError && (
            <Alert severity="error" onClose={handleCloseError}>
              {String(tokenData.error)}
            </Alert>
          )}
          <FormControl>
            <Select
              fullWidth
              value={formik.values.chainId}
              onChange={formik.handleChange}
              name="chainId"
              renderValue={(value) => {
                const network = NETWORKS[value as keyof typeof NETWORKS] as Network;
                return (
                  <Stack
                    direction="row"
                    alignItems="center"
                    alignContent="center"
                    spacing={1}
                  >
                    <Avatar
                      src={ipfsUriToUrl(network.imageUrl || '')}
                      style={{ width: 'auto', height: '1rem' }}
                    />
                    <Typography variant="body1">
                      {network.name}
                    </Typography>
                  </Stack>
                );
              }}
            >
              {Object.entries(NETWORKS)
                .filter(([, network]) => !network.testnet)
                .map(([key, network]) => (
                  <MenuItem key={key} value={Number(key)}>
                    <ListItemIcon>
                      <Box
                        sx={{
                          width: (theme) => theme.spacing(4),
                          display: 'flex',
                          alignItems: 'center',
                          alignContent: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Avatar
                          src={ipfsUriToUrl(network.imageUrl || '')}
                          sx={{
                            width: 'auto',
                            height: '1rem',
                          }}
                        />
                      </Box>
                    </ListItemIcon>
                    <ListItemText primary={network.name} />
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            value={formik.values.contractAddress}
            onChange={handleAddressChange}
            name="contractAddress"
            label={intl.formatMessage({
              id: 'contract.address',
              defaultMessage: 'Contract address',
            })}
            error={Boolean(formik.errors.contractAddress)}
            helperText={formik.errors.contractAddress}
          />
          <TextField
            fullWidth
            disabled={true}
            value={formik.values.name}
            onChange={formik.handleChange}
            name="name"
            label={intl.formatMessage({
              id: 'name',
              defaultMessage: 'Name',
            })}
          />
          <TextField
            fullWidth
            disabled={true}
            value={formik.values.symbol}
            onChange={formik.handleChange}
            name="symbol"
            label={intl.formatMessage({
              id: 'symbol',
              defaultMessage: 'Symbol',
            })}
          />
          <TextField
            disabled={true}
            type="number"
            fullWidth
            value={formik.values.decimals}
            onChange={formik.handleChange}
            name="decimals"
            label={intl.formatMessage({
              id: 'decimals',
              defaultMessage: 'Decimals',
            })}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          disabled={!formik.isValid || tokenData.isLoading}
          onClick={handleSubmitForm}
          variant="contained"
          color="primary"
        >
          {intl.formatMessage({
            id: "import",
            defaultMessage: "Import",
            description: "Import"
          })}
        </Button>
        <Button onClick={handleClose}>
          {intl.formatMessage({
            id: "cancel",
            defaultMessage: "Cancel",
            description: "Cancel"
          })}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ImportTokenDialog;
