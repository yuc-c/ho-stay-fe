<template>

    <div class="container">
      <ul class="progressbar">
        <li v-for="(i, index) in step" :key="index" :class="{'active':index < currentStep}">{{ i }}</li>
      </ul>
    </div>

</template>
<script setup>
    const props = defineProps(['step', 'currentStep']);
    console.log(props.currentStep);
</script>


<style scoped>
  .container {
    max-width: 600px;
    margin-top: 20px;
  }

  .progressbar {
    display: flex;
    counter-reset: step;
  }

  .progressbar li {
    list-style-type: none;
    float: left;
    flex: 1;  
    position: relative;
    text-align: center;
  }
/* 圓圈 */
  .progressbar li:before {
    content: counter(step);
    counter-increment: step;
    width: 30px;
    height: 30px;
    border: 2px solid #bebebe;
    display: block;
    margin: 0 auto 10px auto;
    border-radius: 50%;
    line-height: 27px;
    background: white;
    color: #bebebe;
    text-align: center;
    font-weight: bold;
  }
/* 線條 */
  .progressbar li:after {
    content: '';
    position: absolute;
    width: 100%;
    height: 3px;
    background: #979797;
    top: 15px;
    left: -50%;
    z-index: -1;
  }

  .progressbar li.active:before {
    border-color: #3aac5d;
    background: #3aac5d;
    color: white
  }

  .progressbar li.active:after {
    background: #3aac5d;
  }

  .progressbar li.active  li:after {
    background: #3aac5d;
  }

  .progressbar li.active  li:before {
    border-color: #3aac5d;
    background: #3aac5d;
    color: white
  }

  .progressbar li:first-child:after {
    content: none;
  }
</style>