<!-- createForm.vue -->
<template>
  <div class="form-group">
    <input
        :type="type"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        :placeholder="placeholder"
        :name="name"
        :id="id"
        :required="required"
        class="form-control"
    />
  </div>
</template>

<script>
export default {
  props: {
    modelValue: String,
    type: String,
    placeholder: String,
    name: String,
    id: String,
    required: Boolean
  },
  emits: ['update:modelValue']
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600&display=swap');


.input-container {
  margin-bottom: 15px;
}


input {
  width: 130%;
  background-color: #585858;
  padding: 10px;
  margin: 5px 0 22px 0;
  display: inline-block;
  border-radius: 5px;
  border: 1px solid #686868;
  font-family: 'Outfit', sans-serif;
  font-weight: 500;
  font-size: 16px;
  line-height: 20px;
  color: #ffffff;
  box-sizing: border-box;
}

input:focus {
  background-color: #585858;
  outline: none;
}
</style>