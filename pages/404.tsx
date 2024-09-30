import { useIntl } from 'react-intl';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Button, Container, Grid, Typography } from '@mui/material';
import type { NextPage } from 'next';
import MainLayout from '../src/components/layouts/main';

import Image from 'next/image';

import catHeroImg from '../public/assets/images/cat-hero.svg';
import Link from '../src/components/Link';

const NotFound: NextPage = () => {
  const intl = useIntl();

  return (
    <MainLayout>
      <Box sx={{ py: 8 }}>
        <Container>
          <Grid container alignItems="center" spacing={4}>
            <Grid
              item
              xs={12}
              sm={6}
              sx={{
                order: { xs: 2, sm: 1 },
              }}
            >
              <Typography
                sx={{ textAlign: { sm: 'left', xs: 'center' } }}
                variant="body1"
                color="primary"
              >
                {intl.formatMessage({
                  id: "oop.page.not.found",
                  defaultMessage: "Oops, page not found"
                })}
              </Typography>
              <Typography
                sx={{ textAlign: { sm: 'left', xs: 'center' } }}
                variant="h1"
                component="h1"
              >
                {intl.formatMessage({ id: "error.404", defaultMessage: "Error 404" })}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: { xs: 'center', sm: 'flex-start' },
                  pt: { xs: 2, sm: 0 },
                }}
              >
                <Button
                  component={Link}
                  href="/"
                  startIcon={<ArrowBackIcon />}
                  variant="contained"
                  color="primary"
                >
                  {intl.formatMessage({
                    id: "back.to.home",
                    defaultMessage: "Back to Home"
                  })}
                </Button>
              </Box>
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
              sx={{
                order: { xs: 1, sm: 2 },
              }}
            >
              <Image src={catHeroImg} alt="Cat Hero" />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </MainLayout>
  );
};

export default NotFound;
