<img alt="man with map on top of 404-error statue trying to figure out what to do" src="artError-3.svg">

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
      width: 20em;
      height: auto;
      margin-top: -2rem;
      filter: drop-shadow(var(--shadow-elevation-medium));
      @media screen and (max-width: 600px) {
         width: 15em;
      }
      animation: wiggle 500ms;
      animation-delay: 2250ms;
      animation-fill-mode: both;
   }
</style>

<!--
   https://designs.ai/graphicmaker/illustrations/Flat_Outline_Set/18-designer-man
   https://designs.ai/graphicmaker/illustrations/Isometric_Design_Set/10-fatal-error
-->