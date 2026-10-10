<script setup>
import {useI18n} from "vue-i18n";
import {useRoute, useRouter} from "vue-router";
import useIamStore from "../../application/iam.store.js";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const store = useIamStore();

const roleIcons = {
  FARMER: 'pi pi-sun',
  COOPERATIVE_DIRECTOR: 'pi pi-users',
  AGRONOMIST: 'pi pi-shield'
};

/**
 * Starts the demo session and opens the requested page or the role's home.
 * @param {import('../../domain/model/user.entity.js').User} user - Chosen user.
 */
const selectUser = (user) => {
  store.selectUser(user.id, router, route.query['redirect']);
};
</script>

<template>
  <main class="demo-access">
    <section class="demo-access__content">
      <div class="demo-access__brand">
        <span class="demo-access__brand-name">Sumaq<span>Agro</span></span>
        <p>{{ t('app.tagline') }}</p>
      </div>

      <h1>{{ t('iam.welcome') }}</h1>
      <p class="demo-access__description">{{ t('iam.choose-experience') }}</p>
      <p class="demo-access__notice">{{ t('iam.demo-notice') }}</p>

      <div class="demo-access__users">
        <pv-card v-for="user in store.users" :key="user.id" class="demo-access__card">
          <template #content>
            <div class="flex flex-wrap md:flex-nowrap align-items-center gap-3">
              <i :class="roleIcons[user.experience]" class="demo-access__icon" aria-hidden="true"/>
              <div>
                <h2>{{ user.displayName }}</h2>
                <p>{{ t(`iam.roles.${user.experience}`) }}</p>
              </div>
              <pv-button
                  class="demo-access__enter"
                  :aria-label="t('iam.enter-as', { name: user.displayName })"
                  :label="t('iam.enter')"
                  icon="pi pi-arrow-right"
                  icon-pos="right"
                  @click="selectUser(user)"/>
            </div>
          </template>
        </pv-card>
      </div>
    </section>
  </main>
</template>

<style scoped>
.demo-access {
  display: grid;
  min-height: 100vh;
  place-items: center;
  padding: 24px;
  background: #f4f5f1;
}

.demo-access__content {
  width: min(100%, 720px);
}

.demo-access__brand {
  margin-bottom: 36px;
  color: #00665b;
}

.demo-access__brand-name {
  font-size: 1.6rem;
  font-weight: 700;
}

.demo-access__brand-name span {
  color: #368e37;
}

.demo-access__brand p {
  margin: 4px 0 0;
  color: #55635b;
}

h1 {
  margin: 0;
  color: #17231e;
  font-size: clamp(2rem, 5vw, 3rem);
  line-height: 1.15;
}

.demo-access__description {
  margin: 12px 0 8px;
  color: #5d6963;
  font-size: 1.05rem;
}

.demo-access__notice {
  margin: 0 0 28px;
  color: #5d6963;
  font-size: 0.85rem;
}

.demo-access__users {
  display: grid;
  gap: 16px;
}

.demo-access__card {
  border: 1px solid #b9d9c1;
  border-radius: 16px;
  box-shadow: none;
}

.demo-access__icon {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  color: #00665b;
  background: #dcefdc;
  font-size: 1.3rem;
}

h2 {
  margin: 0;
  color: #17231e;
  font-size: 1.1rem;
}

.demo-access__card p {
  margin: 4px 0 0;
  color: #5d6963;
}

.demo-access__enter.p-button {
  margin-left: auto;
  border-color: #00796b;
  background: #00796b;
  border-radius: 9999px;
}

@media (max-width: 600px) {
  .demo-access__enter.p-button {
    width: 100%;
    margin-left: 0;
  }
}
</style>
