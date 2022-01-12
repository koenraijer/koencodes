<script>
        let email;
</script>
<div class="wrapper">
    <div class="form-wrapper">
    
        <form action="https://formsapi.jabwn.com/key/BepFQzVvugOXeSHxVDNq" method="post">
            <h2>Keep in touch!</h2>
            <br>
            <ol>
                <li>
                    <input type="hidden" name="_valid[name]" value="required">
                    <input type="hidden" name="_valid[email]" value="required|valid_email">
                    <input type="hidden" name="_valid[message]" value="required">
                    <input type="hidden" name="_confirmation" value="Thank you! I'll get back to you ASAP as possible.">
                    <input type="text" name="_honey" value="" style="display:none">
                    <input type="text" name="_kitemt" value="" style="display:none">
                    <label for="field-volatile">Name</label>
                    <input type="text" name="Name" class="nameField text" bind:value={email} required aria-required="true" autocorrect="off" autocapitalize="on">
                </li>
                <li>
                    <label for="field-volatile">E-mail</label>
                    <input name="E-mail" type="text" class="emailField text" required aria-required="true" autocorrect="off" autocapitalize="on">
                </li>
                <li>
                    <label for="field-volatile">Message</label>
                    <textarea name="Message" class="messageField text" form="usrform" required aria-required="true" autocorrect="off" autocapitalize="on"></textarea>
                </li>
                <li>
                    <input type="text" name="_honey" value="" style="display:none">
                    <input type="submit" value="Send message">


                </li>
            </ol>
        </form>
    </div>
</div>


<style lang="scss">
    .wrapper {
        display: grid;
        place-items: center;
        grid-gap: var(--spacing-unit);
        padding: var(--spacing-unit);
    }

     .form-wrapper {
         @media screen and (max-width: 900px) {
            margin-top: calc(var(--spacing-unit) * 2);
         }
        display: grid;
        place-items: center;
        align-items: start;
        text-align: left;
    }
     form {
        box-shadow: var(--shadow-elevation-medium);
        background: var(--gray-400);
        padding: calc(1.5* var(--spacing-unit));
        width: 100%;
        border-radius: var(--corner-unit);
    }

    ol {
        list-style: none;
        margin: 0;
        padding: 0;
        li {
            display: grid;
            grid-template-columns: 1fr;
            grid-gap: 0.25rem;
            padding-bottom: 1.5rem;
            &:last-child {
                display: block;
            }
        }
    }

    input[type="submit"] {
    color: white;
    display: inline-block;
    padding: 0.5rem 0.85rem 0.5rem;

    border-radius: calc(var(--corner-unit));
    background: var(--primary-200);
    border: none;
    box-shadow: var(--shadow-elevation-medium);
    text-decoration: none;
    font-weight: 600;
    &:hover {
        box-shadow: var(--shadow-elevation-mediumhigh);
        background: var(--primary-300);
        color: white;
        transition: 0.2s ease-in-out;
        cursor: pointer;
    }
    @media screen and (max-width: 500px) {
        margin: var(--spacing-unit) calc(var(--spacing-unit) * 0.75) 0rem
    }

}


    label {
        color: var(--gray-200);
    }
        .text {
        font-size: inherit;
        background: white;
        box-shadow: none;
        border-style: none;
        border-radius: calc(var(--corner-unit) * 0.5);
        appearance: none;
        -moz-appearance: none;
        -webkit-appearance: none;
        box-shadow: var(--shadow-elevation-low);
        padding: 0.25rem;
        margin: 0;
        &:-webkit-outer-spin-button,
        &:-webkit-inner-spin-button {
        -webkit-appearance: none;
        }
        -moz-appearance: textfield;
        transition: box-shadow ease 0.25s;
        &:focus {
            box-shadow: var(--shadow-elevation-medium);
            outline: none;
        }
    }

    .nameField {
        width: 12rem;
    }

    .emailField {
        width: 15rem;
    }
</style>