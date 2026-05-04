<template>
  <section class="product-banner">
    <v-container class="py-12" style="max-width: 1200px;">
      <div class="banner-content">
        <p class="banner-label">
          Snacks from across the world
        </p>

        <h1 class="text-h3 font-weight-bold mb-4 banner-title">
          Quality products, curated for you
        </h1>

        <p class="text-body-1 banner-description">
          explore the world through your taste buds with our wide selection of snacks from around the globe. From savory to sweet, we have something for every craving. 
          Indulge in the flavors of different cultures and discover new favorites with us.
        </p>
      </div>
    </v-container>
  </section>
</template>

<style scoped>
.product-banner {
  position: relative;
  width: 100%;
  min-height: 380px;
  display: flex;
  align-items: center;

  background-image: url('https://learntoflyblog.com/wp-content/uploads/2023/10/Cumulus-Clouds.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

/* gradient overlay */
.product-banner::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to right,
    rgba(250, 251, 252, 0.96) 0%,
    rgba(250, 251, 252, 0.86) 45%,
    rgba(250, 251, 252, 0.35) 75%,
    rgba(250, 251, 252, 0.1) 100%
  );
}

.banner-content {
  position: relative;
  z-index: 1;
  max-width: 620px;
  padding: 32px 0;
}

.banner-label {
  color: #1a365d;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 12px;
}

.banner-title {
  color: #222;
  line-height: 1.15;
}

.banner-description {
  color: #444;
  line-height: 1.7;
  max-width: 560px;
}

/* mobile */
@media (max-width: 600px) {
  .product-banner {
    min-height: 320px;
    background-position: center right;
  }

  .product-banner::before {
    background: rgba(250, 251, 252, 0.9);
  }

  .banner-title {
    font-size: 2rem !important;
  }
}
</style>