<img alt="man with map on top of 404-error statue trying to figure out what to do" src="Basicvignet.svg">

<style lang="scss">
   @keyframes wiggle {
      0% {
         transform: rotate(0turn);
      }
      33% {
         transform: rotate(0.012turn);
      }
      66% {
         transform: rotate(-0.012turn);
      }

   }

   img {
      width: 10em;
      height: auto;
      margin-top: 0;
      filter: drop-shadow(var(--shadow-elevation-medium));
      @media screen and (max-width: 600px) {
         width: 6em;
         margin: var(--spacing-unit);
      }
      @media screen and (max-width: 900px) {
         width: 8em;
      }
      animation: wiggle 500ms;
      animation-delay: 500ms;
      animation-fill-mode: both;
   }
</style>

<!--
   https://designs.ai/graphicmaker/illustrations/Flat_Outline_Set/18-designer-man
   https://designs.ai/graphicmaker/illustrations/Isometric_Design_Set/10-fatal-error
-->