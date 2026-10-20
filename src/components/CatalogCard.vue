<script setup>
// Book metadata as a library catalogue card.
import { computed } from 'vue'
import SpineLabel from '@/components/SpineLabel.vue'

const props = defineProps({
  book: { type: Object, required: true },
})

const published = computed(() => {
  const year = props.book.year !== 'N/A' ? props.book.year : ''
  return [props.book.publisher, year].filter(Boolean).join(', ')
})

const rating = computed(() => {
  if (!props.book.averageRating) return ''
  const count = props.book.ratingsCount
  return `${props.book.averageRating} of 5, ${count} rating${count === 1 ? '' : 's'}`
})
</script>

<template>
  <article class="el-catalog" aria-label="Catalogue card">
    <div class="el-catalog__head">
      <h2 class="el-catalog__title">{{ book.title }}</h2>
      <SpineLabel :book="book" />
    </div>
    <dl>
      <dt>Author</dt>
      <dd>
        <em>{{ book.authors }}</em>
      </dd>
      <template v-if="published">
        <dt>Published</dt>
        <dd>{{ published }}</dd>
      </template>
      <template v-if="book.pageCount">
        <dt>Pages</dt>
        <dd class="is-mono">{{ book.pageCount }}</dd>
      </template>
      <template v-if="book.language">
        <dt>Language</dt>
        <dd class="is-mono">{{ book.language.toUpperCase() }}</dd>
      </template>
      <template v-if="book.categories?.length">
        <dt>Subjects</dt>
        <dd>{{ book.categories.join(', ') }}</dd>
      </template>
      <template v-if="book.isbn">
        <dt>ISBN</dt>
        <dd class="is-mono">{{ book.isbn }}</dd>
      </template>
      <template v-if="rating">
        <dt>Rating</dt>
        <dd>{{ rating }}</dd>
      </template>
    </dl>
  </article>
</template>
