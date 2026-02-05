import {
  Container,
  Text,
  Box,
  Loader,
  Center,
  Alert,
  Modal,
  Stack,
} from '@mantine/core';
import {
  IconAlertCircle,
} from '@tabler/icons-react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import useTranslation from 'next-translate/useTranslation';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { useState, useEffect } from 'react';
import { ChatWidget } from '@/components/chat/ChatWidget';
import { QRCodeGenerator } from '@/components/qr/QRCodeGenerator';
import { useMerchantPublicProducts, ProductQueryParams } from '@/lib/hooks/useProducts';
import { ViewMode } from '@/components/products/ProductViewControls';
import { MerchantHeader } from '@/components/merchant/MerchantHeader';
import { MerchantProducts } from '@/components/merchant/MerchantProducts';
import { PublicMerchant } from '@/components/merchant/types';
import { MerchantPublicHeader } from '@/components/merchant/MerchantPublicHeader';

export default function MerchantPublicPage() {
  const router = useRouter();
  const { slug } = router.query;
  const { t } = useTranslation('common');
  const [showQR, setShowQR] = useState(false);

  // View state
  const [viewMode, setInnerViewMode] = useState<ViewMode>('grid');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('merchant-view-mode');
      if (saved === 'grid' || saved === 'table') {
        setInnerViewMode(saved as ViewMode);
      }
    }
  }, []);

  const setViewMode = (mode: ViewMode) => {
    setInnerViewMode(mode);
    localStorage.setItem('merchant-view-mode', mode);
  };

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<NonNullable<ProductQueryParams['sortBy']>>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { data: merchant, isLoading: merchantLoading, error: merchantError } = useQuery<PublicMerchant>({
    queryKey: ['merchant', slug],
    queryFn: async () => {
      const { data: response } = await apiClient.get(API_ENDPOINTS.merchants.getBySlug(slug as string));
      return response.data;
    },
    enabled: !!slug && typeof slug === 'string',
  });

  const { data: productsData, isLoading: productsLoading } = useMerchantPublicProducts(
    merchant?.id || '',
    {
      page,
      limit: 12,
      search,
      sortBy,
      sortOrder,
    },
  );

  const products = productsData?.products || [];
  const pagination = productsData?.pagination;

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: merchant?.name || 'Check out this store',
          text: merchant?.description || 'View products from this merchant',
          url,
        });
      } catch {
        // User cancelled or share failed - silently ignore
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url);
      // eslint-disable-next-line no-alert
      window.alert('Link copied to clipboard!');
    }
  };

  if (merchantLoading || !slug) {
    return (
      <Container size="lg" py="xl">
        <Center h={400}>
          <Loader size="lg" />
        </Center>
      </Container>
    );
  }

  if (merchantError || !merchant) {
    return (
      <Container size="lg" py="xl">
        <Alert icon={<IconAlertCircle size={16} />} title={t('merchant_page.store_not_found')} color="red">
          {t('merchant_page.store_not_found_desc')}
        </Alert>
      </Container>
    );
  }

  return (
    <Box>
      {/* Public Header with Branding */}
      <MerchantPublicHeader />

      {/* Merchant Header */}
      <MerchantHeader
        merchant={merchant}
        onShare={handleShare}
        onShowQR={() => setShowQR(!showQR)}
      />

      {/* Products Section */}
      <MerchantProducts
        isLoading={productsLoading}
        products={products}
        viewMode={viewMode}
        setViewMode={setViewMode}
        search={search}
        setSearch={setSearch}
        setPage={setPage}
        sortBy={sortBy}
        setSortBy={setSortBy as (sort: string) => void}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        pagination={pagination}
        page={page}
      />

      {/* Floating Chat Widget */}
      {merchant.isChatEnabled && (
        <ChatWidget merchantId={merchant.id} merchantName={merchant.name} />
      )}

      {/* QR Code Modal */}
      <Modal
        opened={showQR}
        onClose={() => setShowQR(false)}
        title={t('merchant_page.qr_modal_title')}
        centered
        size="auto"
      >
        <Stack align="center" gap="lg" p="md">
          <Text size="sm" c="dimmed" ta="center">
            {t('merchant_page.qr_modal_subtitle')}
          </Text>
          <Box
            p="lg"
            style={{
              backgroundColor: 'white',
              borderRadius: 12,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            }}
          >
            <QRCodeGenerator
              value={typeof window !== 'undefined' ? window.location.href : ''}
              size={300}
              margin={2}
            />
          </Box>
          <Text size="xs" c="dimmed" ta="center" maw={300}>
            {typeof window !== 'undefined' ? window.location.href : ''}
          </Text>
        </Stack>
      </Modal>
    </Box>
  );
}
