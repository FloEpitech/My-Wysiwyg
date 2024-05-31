import { MyWysiwyg } from "/modules/my_wysiwyg.js";

document.addEventListener("DOMContentLoaded", () => {
    let mw = new MyWysiwyg(document.querySelector("textarea"), {
        buttons: [
            "bold",
            "italic",
            "strikethrough",
            "color",
            "lien",
            "text-left",
            "text-right",
            "text-center",
            "text-justify",
            "switch",
            "increase trait",
            "decrease trait",
            "increase police",
            "decrease police",
            "save",
            "video",
            "image",
        ],
    });
});
