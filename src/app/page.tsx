'use client';

import {
  contentList,
  contentObject,
  contentText,
  platformProductDetailHref,
  useSiteData,
  useProducts,
} from '@/lib/siteDataContext';
import { pageRoute, withBasePath } from '@/lib/utils';
import {
  EditableText,
  EditableList,
  EditableCard,
  EditableImage,
} from '@deneb-ui/ui';
import { useIsEditorPreview } from '@/lib/useIsEditorPreview';

function navigate(pageKey: string) {
  window.location.href = withBasePath(pageRoute(pageKey));
}

export default function HomePage() {
  const siteData = useSiteData();
  const isEditorPreview = useIsEditorPreview();
  const content = contentObject(siteData.content);
  const home = contentObject(content.home);
  const features = contentList(home.features);
  const products = useProducts();
  const demoCta = contentObject(
    (contentList(home.demoPreOrderCta)[0] as Record<string, unknown> | undefined) ?? {}
  );
  const demoCtaLabel = contentText(demoCta.buttonLabel) || 'Book a Demo';
  const demoCtaUrl = contentText(demoCta.buttonUrl) || '';
  const selectedPages =
    siteData.requirements?.requiredPages ??
    siteData.template?.structure?.pages ??
    [];

  return (
    <div data-preview-page-key="home">
      <section className="hero" data-design-section="home-hero">
        <div className="hero-copy">
          <EditableText
            variant="eyebrow"
            color="primary"
            className="eyebrow"
            data-preview-field-path="home.heroEyebrow"
            defaultValue={contentText(home.heroEyebrow)}
          />
          <EditableText
            variant="h1"
            size="5xl"
            weight="bold"
            align="left"
            color="heading"
            data-preview-field-path="home.heroTitle"
            defaultValue={contentText(home.heroTitle)}
          />
          <EditableText
            variant="lead"
            color="muted"
            data-preview-field-path="home.heroSummary"
            defaultValue={contentText(home.heroSummary)}
          />
          <div className="cta-row">
            {selectedPages.includes('contact') ? (
              <button
                type="button"
                data-target-page="contact"
                className="button-primary"
                onClick={() => navigate('contact')}
              >
                <span data-preview-field-path="home.primaryCtaLabel">
                  {contentText(home.primaryCtaLabel)}
                </span>
              </button>
            ) : (
              <span
                data-target-page="contact"
                className="button-primary unavailable"
                data-preview-field-path="home.primaryCtaLabel"
              >
                {contentText(home.primaryCtaLabel)}
              </span>
            )}
            {selectedPages.includes('about_us') ? (
              <button
                type="button"
                data-target-page="about_us"
                className="button-secondary"
                onClick={() => navigate('about_us')}
              >
                <span data-preview-field-path="home.secondaryCtaLabel">
                  {contentText(home.secondaryCtaLabel)}
                </span>
              </button>
            ) : (
              <span
                data-target-page="about_us"
                className="button-secondary unavailable"
                data-preview-field-path="home.secondaryCtaLabel"
              >
                {contentText(home.secondaryCtaLabel)}
              </span>
            )}
          </div>
        </div>
        <div className="hero-fivora-wrap">
          <img
            className="hero-image"
            src={withBasePath(
              contentText(home.bannerImageUrl) || '/fivora-icon.svg',
            )}
            alt="Fivora"
            data-preview-field-path="home.bannerImageUrl"
          />
        </div>
      </section>

      <section
        className="page-section"
        data-design-section="home-introduction"
      >
        <div className="home-intro-copy">
          <EditableText
            variant="h2"
            size="3xl"
            weight="bold"
            align="center"
            color="heading"
            data-preview-field-path="home.introTitle"
            defaultValue={contentText(home.introTitle)}
          />
          <EditableText
            variant="lead"
            align="center"
            color="muted"
            data-preview-field-path="home.introBody"
            defaultValue={contentText(home.introBody)}
          />
          <div
            style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}
            data-preview-list-path="home.demoPreOrderCta"
          >
            {contentList(home.demoPreOrderCta).map((rawCta, index) => {
              const cta = contentObject(rawCta);
              const label = contentText(cta.buttonLabel) || 'Book a Consultation';
              const url = contentText(cta.buttonUrl) || '#';
              return (
                <a
                  key={index}
                  href={url}
                  className="button-primary"
                  data-preview-item-path={`home.demoPreOrderCta[${index}]`}
                  data-preview-field-path={`home.demoPreOrderCta[${index}].buttonUrl`}
                >
                  <span data-preview-field-path={`home.demoPreOrderCta[${index}].buttonLabel`}>
                    {label}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      <section
        className="page-section alt"
        data-design-section="home-features"
      >
        <div className="section-header">
          <EditableText
            variant="h2"
            size="3xl"
            weight="bold"
            align="center"
            color="heading"
            className="section-title"
            data-preview-field-path="home.featuresHeading"
            defaultValue={contentText(home.featuresHeading)}
          />
        </div>
        <EditableList
          data-preview-list-path="home.features"
          items={features}
          className="card-grid"
          itemAs={false}
        >
          {(rawFeature, index) => {
            const feature = contentObject(rawFeature);
            return (
              <EditableCard
                className="card"
                key={index}
                itemPath={`home.features[${index}]`}
                data-preview-item-path={`home.features[${index}]`}
                item={feature as any}
                balance
                minHeight="220px"
                radius="16px"
              >
                <EditableText
                  variant="h3"
                  color="heading"
                  data-preview-field-path={`home.features[${index}].title`}
                  defaultValue={contentText(feature.title)}
                />
                <EditableText
                  variant="p"
                  color="muted"
                  data-preview-field-path={`home.features[${index}].body`}
                  defaultValue={contentText(feature.body)}
                />
              </EditableCard>
            );
          }}
        </EditableList>
      </section>

      <section
        className="page-section"
        data-design-section="home-products"
      >
        <div className="section-header product-section-header">
          <EditableText
            variant="h2"
            size="3xl"
            weight="bold"
            align="center"
            color="heading"
            className="section-title"
            data-preview-field-path="home.productsHeading"
            defaultValue={contentText(home.productsHeading)}
          />
          <EditableText
            variant="lead"
            align="center"
            color="muted"
            data-preview-field-path="home.productsSummary"
            defaultValue={contentText(home.productsSummary)}
          />
        </div>

        <div className="card-grid" data-preview-list-path="products">
          {products.map((rawProduct, index) => {
            const product = contentObject(rawProduct);
            const productId =
              typeof product.id === 'string' || typeof product.id === 'number'
                ? product.id
                : null;
            const price = typeof product.price === 'number' ? product.price : parseFloat(String(product.price || 0));
            const compareAt = typeof product.compareAtPrice === 'number' ? product.compareAtPrice : parseFloat(String(product.compareAtPrice || 0));
            const currency = contentText(product.currency) || 'LKR';
            const badge = contentText(product.badge);
            const category = contentText(product.category);

            const itemShowPrice =
              (product as any)?.showPrice !== undefined
                ? Boolean((product as any).showPrice)
                : ((product as any)?.customData?.showPrice !== undefined
                  ? Boolean((product as any).customData.showPrice)
                  : true);
            const isRange = Boolean(
              (product as any)?.isPriceRange ||
              ((product as any)?.minPrice !== undefined && (product as any)?.maxPrice !== undefined) ||
              (product as any)?.priceRange
            );
            let displayPrice = `${currency} ${price}`;
            if (isRange) {
              if ((product as any).priceRange) {
                displayPrice = String((product as any).priceRange);
              } else {
                const min = (product as any).minPrice !== undefined ? (product as any).minPrice : price;
                const max = (product as any).maxPrice !== undefined ? (product as any).maxPrice : price;
                displayPrice = `${currency} ${min} – ${currency} ${max}`;
              }
            }

            return (
              <EditableCard
                key={productId ?? index}
                className="card product-card"
                item={product as any}
                itemPath={`products[${index}]`}
                imageKey="__custom__"
                data-preview-item-path={`products[${index}]`}
                balance
                radius="xl"
                style={{ display: 'flex', flexDirection: 'column' }}
              >
                {isEditorPreview ? (
                  <div
                    style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px', marginBottom: '0.75rem', display: 'block' }}
                  >
                    <EditableImage
                      src={contentText(product.imageUrl) || '/placeholder.svg'}
                      alt={contentText(product.name)}
                      data-preview-field-path={`products[${index}].imageUrl`}
                      aspectRatio="4/3"
                      fit="cover"
                      radius="lg"
                    />
                    <span
                      className="badge-primary"
                      data-preview-field-path={`products[${index}].badge`}
                      style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10, minWidth: '1.5ch', minHeight: '1.2em' }}
                    >
                      {badge}
                    </span>
                  </div>
                ) : (
                  <div
                    style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px', marginBottom: '0.75rem', display: 'block' }}
                  >
                    <a
                      href={platformProductDetailHref(productId)}
                      style={{ display: 'block' }}
                    >
                      <EditableImage
                        src={contentText(product.imageUrl) || '/placeholder.svg'}
                        alt={contentText(product.name)}
                        data-preview-field-path={`products[${index}].imageUrl`}
                        aspectRatio="4/3"
                        fit="cover"
                        radius="lg"
                      />
                    </a>
                    {badge && (
                      <span
                        className="badge-primary"
                        data-preview-field-path={`products[${index}].badge`}
                        style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10 }}
                      >
                        {badge}
                      </span>
                    )}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '0.5rem' }}>
                  {(category || isEditorPreview) && (
                    <span
                      className="tag"
                      data-preview-field-path={`products[${index}].category`}
                      style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', minWidth: '1.5ch', minHeight: '1.2em' }}
                    >
                      {category}
                    </span>
                  )}
                  {isEditorPreview ? (
                    <EditableText
                      variant="h3"
                      size="lg"
                      weight="bold"
                      color="heading"
                      data-preview-field-path={`products[${index}].name`}
                      defaultValue={contentText(product.name)}
                    />
                  ) : (
                    <a
                      href={platformProductDetailHref(productId)}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <EditableText
                        variant="h3"
                        size="lg"
                        weight="bold"
                        color="heading"
                        data-preview-field-path={`products[${index}].name`}
                        defaultValue={contentText(product.name)}
                      />
                    </a>
                  )}
                  <EditableText
                    variant="p"
                    color="muted"
                    data-preview-field-path={`products[${index}].description`}
                    defaultValue={contentText(product.description)}
                  />
                  {isEditorPreview && (
                    <div
                      style={{
                        display: 'grid',
                        gap: '6px',
                        padding: '10px 12px',
                        border: '1px dashed var(--color-border, #94a3b8)',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    >
                      <strong data-preview-static="product-pricing-settings-heading">Pricing settings</strong>

                      <div>
                        <span data-preview-static="product-show-price-label">Show price: </span>
                        <span data-preview-field-path={`products[${index}].showPrice`}>
                          {itemShowPrice ? 'Yes' : 'No'}
                        </span>
                      </div>

                      {!itemShowPrice && (
                        <div>
                          <span data-preview-static="product-price-label">Price: </span>
                          <span data-preview-field-path={`products[${index}].price`}>
                            {displayPrice}
                          </span>
                        </div>
                      )}

                      <div>
                        <span data-preview-static="product-price-range-enabled-label">Price range enabled: </span>
                        <span data-preview-field-path={`products[${index}].isPriceRange`}>
                          {String(product.isPriceRange ?? false)}
                        </span>
                      </div>

                      <div>
                        <span data-preview-static="product-min-price-label">Minimum price: </span>
                        <span data-preview-field-path={`products[${index}].minPrice`}>
                          {String(product.minPrice ?? 0)}
                        </span>
                      </div>

                      <div>
                        <span data-preview-static="product-max-price-label">Maximum price: </span>
                        <span data-preview-field-path={`products[${index}].maxPrice`}>
                          {String(product.maxPrice ?? 0)}
                        </span>
                      </div>

                      <div>
                        <span data-preview-static="product-price-range-label">Price range: </span>
                        <span data-preview-field-path={`products[${index}].priceRange`}>
                          {String(product.priceRange || 'Not set')}
                        </span>
                      </div>

                      <div>
                        <span data-preview-static="product-compare-at-price-label">Compare at price: </span>
                        <span data-preview-field-path={`products[${index}].compareAtPrice`}>
                          {compareAt}
                        </span>
                      </div>
                    </div>
                  )}
                  {itemShowPrice ? (
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.75rem', flexWrap: 'wrap' }}>
                      <EditableText
                        as="span"
                        weight="bold"
                        size="xl"
                        color="primary"
                        data-preview-field-path={`products[${index}].price`}
                        defaultValue={displayPrice}
                      />
                      {compareAt > 0 && !isRange && (
                        isEditorPreview ? (
                          <span
                            data-preview-static="product-compare-at-price-display"
                            style={{ textDecoration: 'line-through', fontSize: '0.875rem', color: 'var(--muted-text, #64748b)' }}
                          >
                            {`${currency} ${compareAt}`}
                          </span>
                        ) : (
                          <EditableText
                            as="span"
                            color="muted"
                            style={{ textDecoration: 'line-through', fontSize: '0.875rem' }}
                            data-preview-field-path={`products[${index}].compareAtPrice`}
                            defaultValue={`${currency} ${compareAt}`}
                          />
                        )
                      )}
                    </div>
                  ) : (
                    <div style={{ marginTop: 'auto', paddingTop: '0.75rem' }}>
                      <span
                        data-preview-static="product-price-on-request"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          color: 'var(--muted-text, #94a3b8)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                        }}
                      >
                        Price on Request
                      </span>
                    </div>
                  )}

                  <div style={{ marginTop: '0.75rem' }}>
                    <a
                      href={platformProductDetailHref(productId)}
                      className="button-secondary"
                      style={{ width: '100%', textAlign: 'center' }}
                      data-preview-static="Open the stable live product detail page"
                    >
                      View details
                    </a>
                  </div>
                </div>
              </EditableCard>
            );
          })}
        </div>
      </section>
    </div>
  );
}
