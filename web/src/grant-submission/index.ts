import "./form/form";
import rootStyles from "../styles/common.css";


document.addEventListener("click", e => {
    (e.target as {href?: string}).href && e.preventDefault();
});

document.head.appendChild(document.createRange().createContextualFragment(`
<link rel="stylesheet" href="https://unpkg.com/material-components-web@13.0.0/dist/material-components-web.min.css">
<link href="https://fonts.googleapis.com/css?family=Material+Icons&display=block" rel="stylesheet">
<style>${rootStyles}</style>
`));

const $oldForm = document.getElementById("wf-form-Contact-Form") as Node;
const $parent = $oldForm.parentElement as Element;

$parent.removeChild($oldForm);
$parent.appendChild(document.createRange().createContextualFragment(`
<imbu-grant-submission-form></imbu-grant-submission-form>
`));
