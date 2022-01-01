<div class="checkbox-wrapper">
    <input type="checkbox">
    <label class="checkbox-label" for="question-1-option-2">Auguste Renoir</label>
</div>

<style>
    .checkbox-wrapper {
    position: relative; 
    }
    input[type="checkbox"] {
    /*display:  none;*/
    position:  absolute; 
    top:  0px; 
    left: 0px; 
    height:  20px; 
    width:  20px; 
    -webkit-appearance:  none;
    }

    .checkbox-label {
    display:  flex; 
    position:  relative;
    font-size:  20px; 
    font-weight:  400;
    align-items:  center; 
    justify-content:  flex-start; 
    margin-bottom:  20px; 
    }

    .checkbox-label:before, 
    .checkbox-label:after {
    pointer-events: none; 
    }

    .checkbox-label:before {
    display:  flex; 
    content: ' ';
    height:  20px; 
    width:  20px; 
    border:  solid 3px #000;
    background:  #fff;

    margin-right:  10px; 
    }

    .checkbox-label:after {
    position:  absolute; 
    top:  7px; 
    left:  7px; 
    display:  flex; 
    content: ' '; 
    height:  12px; 
    width:  12px;  
    background: #000;
    transform: scale(0);
    transition:  transform .3s ease; 
    }
    .checkbox-label:after {
    height:  5px; 
    width:  12px; 
    left:  5px; 
    border-bottom:  solid 4px #000; 
    border-left:  solid 4px #000; 
    background:  none; 
    transform: rotate(-45deg) scale(0);
    transition:  transform .1s ease, opacity .1s ease;
    transform-origin: center center; 
    }

    .checkbox-wrapper input[type="checkbox"]:checked + .checkbox-label:after {
    opacity:  1; 
    transform: rotate(-45deg) scale(.8);
    }
</style>