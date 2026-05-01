<template>
  <div>
    <h1>Product Page</h1>
    <!-- Other content -->
  </div>
</template>

<script>
export default {
  data() {
    return {
      product: {},
      accountId: null,
    };
  },
  methods: {
    fetchProduct() {
      // Fetch product logic
    },
  },
  mounted() {
    this.fetchProduct();
    // Removed console.log(accountId)
  },
};
</script>

<style scoped>
/* Add styles here */
</style>
