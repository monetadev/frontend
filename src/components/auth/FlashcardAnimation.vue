<template>
  <div class="flashcards-container" ref="containerRef">
    <ScrollingCarousel
        v-for="(cardSet, index) in termSets"
        :key="`carousel-${index}`"
        :cards-data="cardSet"
        :direction="index % 2 === 0 ? 'left' : 'right'"
        :color="carouselColors[index % carouselColors.length]"
        :row-height="rowHeight"
        :card-width="cardWidth"
        :card-height="cardHeight"
        :card-spacing="cardSpacing"
        :scroll-speed="scrollSpeed"
        :container-width="containerWidth"
        :container-height="containerHeight"
    />
  </div>
</template>

<script setup>
// NOTE: Assuming 'termSets', 'carouselColors', and resize handling logic
// are the same as in the previous step (without resize-observer-polyfill import).
// Make sure all necessary imports (ref, computed, etc.) and data are present.

import { ref, computed, onMounted, onBeforeUnmount } from 'vue'; // Removed watch as it's not used here now
import ScrollingCarousel from './ScrollingCarousel.vue';
// Removed ResizeObserver import

const NUM_CAROUSELS = 7;
const containerRef = ref(null);
const containerHeight = ref(0);
const containerWidth = ref(0); // This will be passed down
const scrollSpeed = 0.34;

const rowHeight = computed(() => containerHeight.value > 0 ? containerHeight.value / NUM_CAROUSELS : 0);
const cardHeight = computed(() => rowHeight.value > 0 ? rowHeight.value * 0.85 : 0);
const cardWidth = computed(() => cardHeight.value > 0 ? cardHeight.value * 1.6 : 0);
const cardSpacing = computed(() => cardWidth.value > 0 ? cardWidth.value * 0.15 : 0);

// Simplified termSets structure for brevity in this example
// In FlashcardAnimation.vue

// Define sets of term-definition pairs with SIMPLIFIED definitions
const termSets = [
  // Physics (Example: Keep all your original sets like this)
  [
    { term: "Atom", definition: "Basic unit of matter" },
    { term: "Energy", definition: "Capacity to do work" },
    { term: "Force", definition: "Push or pull" },
    { term: "Gravity", definition: "Attraction between masses" },
    { term: "Momentum", definition: "Mass in motion" },
    { term: "Motion", definition: "Change in position" },
    { term: "Mass", definition: "Amount of matter" },
    { term: "Velocity", definition: "Speed with direction" },
    { term: "Acceleration", definition: "Rate of change of velocity" },
    { term: "Inertia", definition: "Resistance to change in motion" },
    { term: "Density", definition: "Mass per unit volume" },
    { term: "Pressure", definition: "Force per unit area" },
    { term: "Frequency", definition: "Waves per second (Hz)" },
    { term: "Wavelength", definition: "Distance between wave peaks" },
    { term: "Resonance", definition: "Increased amplitude at natural frequency" }
  ],
  // Mathematics
  [
    { term: "Algebra", definition: "Math with symbols" },
    { term: "Calculus", definition: "Math of change" },
    { term: "Geometry", definition: "Study of shapes" },
    { term: "Trigonometry", definition: "Study of triangles" },
    { term: "Statistics", definition: "Analyzing data" },
    { term: "Probability", definition: "Chance of event" },
    { term: "Matrix", definition: "Array of numbers" },
    { term: "Vector", definition: "Magnitude and direction" },
    { term: "Algorithm", definition: "Set of rules" },
    { term: "Equation", definition: "Mathematical statement of equality" },
    { term: "Function", definition: "Input-output relation" },
    { term: "Variable", definition: "Symbol for a value" },
    { term: "Derivative", definition: "Instantaneous rate of change" },
    { term: "Integral", definition: "Area under curve" },
    { term: "Theorem", definition: "Proven statement" }
  ],
  // Biology
  [
    { term: "Cell", definition: "Basic unit of life" },
    { term: "DNA", definition: "Genetic blueprint" },
    { term: "Evolution", definition: "Change over time" },
    { term: "Ecosystem", definition: "Community and environment" },
    { term: "Protein", definition: "Molecule of amino acids" },
    { term: "Metabolism", definition: "Life chemical processes" },
    { term: "Photosynthesis", definition: "Light to energy (plants)" },
    { term: "Neuron", definition: "Nerve cell" },
    { term: "Chromosome", definition: "Structure containing DNA" },
    { term: "Respiration", definition: "Energy release from food" },
    { term: "Mitosis", definition: "Cell division (identical)" },
    { term: "Membrane", definition: "Cell boundary" },
    { term: "Enzyme", definition: "Biological catalyst" },
    { term: "Gene", definition: "Unit of heredity" },
    { term: "Tissue", definition: "Group of similar cells" }
  ],
  // Chemistry
  [
    { term: "Element", definition: "Pure substance (one atom type)" },
    { term: "Molecule", definition: "Group of atoms bonded" },
    { term: "Reaction", definition: "Chemical change process" },
    { term: "Compound", definition: "Substance of multiple elements" },
    { term: "Acid", definition: "Proton donor (pH < 7)" },
    { term: "Base", definition: "Proton acceptor (pH > 7)" },
    { term: "Ion", definition: "Charged atom/molecule" },
    { term: "Catalyst", definition: "Speeds up reaction" },
    { term: "Solution", definition: "Homogeneous mixture" },
    { term: "Isotope", definition: "Atom variant (neutrons)" },
    { term: "Bond", definition: "Force holding atoms" },
    { term: "Valence", definition: "Outer electron shell" },
    { term: "Electron", definition: "Negative subatomic particle" },
    { term: "Periodic", definition: "Table of elements" },
    { term: "Polymer", definition: "Large molecule chain" }
  ],
  // Astronomy
  [
    { term: "Galaxy", definition: "System of stars" },
    { term: "Star", definition: "Luminous plasma ball" },
    { term: "Planet", definition: "Orbits a star" },
    { term: "Comet", definition: "Icy space object" },
    { term: "Nebula", definition: "Interstellar cloud" },
    { term: "Quasar", definition: "Active galactic nucleus" },
    { term: "Constellation", definition: "Star pattern" },
    { term: "Orbit", definition: "Path around object" },
    { term: "Supernova", definition: "Stellar explosion" },
    { term: "Asteroid", definition: "Rocky space object" },
    { term: "Satellite", definition: "Object orbiting another" },
    { term: "Eclipse", definition: "Blocking of light" },
    { term: "Pulsar", definition: "Rotating neutron star" },
    { term: "Universe", definition: "All space and time" },
    { term: "Cosmos", definition: "Universe as ordered whole" }
  ],
  // Computer Science
  [
    { term: "Algorithm", definition: "Problem-solving steps" },
    { term: "Database", definition: "Organized data collection" },
    { term: "Network", definition: "Connected computers" },
    { term: "Encryption", definition: "Securing data" },
    { term: "Interface", definition: "User interaction point" },
    { term: "Compiler", definition: "Code translator" },
    { term: "Protocol", definition: "Communication rules" },
    { term: "Bandwidth", definition: "Data transfer rate" },
    { term: "Boolean", definition: "True/False logic" },
    { term: "Cache", definition: "Fast temporary storage" },
    { term: "Cloud", definition: "Remote computing resources" },
    { term: "Recursion", definition: "Function calling itself" },
    { term: "Kernel", definition: "Core of OS" },
    { term: "Object", definition: "Data and methods bundle" },
    { term: "Function", definition: "Reusable code block" }
  ],
  // Earth Science
  [
    { term: "Volcano", definition: "Mountain erupting lava" },
    { term: "Earthquake", definition: "Ground shaking" },
    { term: "Glacier", definition: "Large ice mass" },
    { term: "Climate", definition: "Long-term weather" },
    { term: "Atmosphere", definition: "Gases around Earth" },
    { term: "Erosion", definition: "Wearing away land" },
    { term: "Tectonic", definition: "Earth's crust plates" },
    { term: "Tsunami", definition: "Large ocean wave" },
    { term: "Mineral", definition: "Natural solid crystal" },
    { term: "Hurricane", definition: "Tropical storm" },
    { term: "Fossil", definition: "Preserved ancient life" },
    { term: "Biome", definition: "Major life zone" },
    { term: "Weather", definition: "Atmospheric conditions" },
    { term: "Magma", definition: "Molten rock below surface" },
    { term: "Canyon", definition: "Deep river valley" }
  ]
];

const carouselColors = [
  'linear-gradient(145deg, #2a3349, #1c2438)',
  'linear-gradient(145deg, #2d3a4a, #1e2a3b)',
  'linear-gradient(145deg, #2a2d49, #1c1e38)',
  'linear-gradient(145deg, #323349, #232538)',
  'linear-gradient(145deg, #3a334d, #28233c)',
  'linear-gradient(145deg, #493336, #382428)',
  'linear-gradient(145deg, #334940, #233830)'
];

let resizeObserverInstance = null;

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => { clearTimeout(timeout); func(...args); };
    clearTimeout(timeout); timeout = setTimeout(later, wait);
  };
}

const updateContainerDimensions = () => {
  if (!containerRef.value) return;
  const rect = containerRef.value.getBoundingClientRect();
  // Update width only if it has changed to prevent unnecessary prop drilling
  if (containerWidth.value !== rect.width) {
    containerWidth.value = rect.width;
  }
  if (containerHeight.value !== rect.height) {
    containerHeight.value = rect.height;
  }
};

const debouncedHandleResize = debounce(updateContainerDimensions, 150); // Increased debounce slightly

onMounted(() => {
  if (!containerRef.value) return;
  updateContainerDimensions(); // Initial check

  if (window.ResizeObserver) {
    resizeObserverInstance = new ResizeObserver(debouncedHandleResize);
    resizeObserverInstance.observe(containerRef.value);
  } else {
    window.addEventListener('resize', debouncedHandleResize);
  }
});

onBeforeUnmount(() => {
  if (resizeObserverInstance) {
    if (containerRef.value) resizeObserverInstance.unobserve(containerRef.value);
    resizeObserverInstance.disconnect();
    resizeObserverInstance = null;
  } else {
    window.removeEventListener('resize', debouncedHandleResize);
  }
});

</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

.flashcards-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #121729;
}
</style>