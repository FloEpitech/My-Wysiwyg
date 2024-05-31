export class MyWysiwyg {
    constructor(element, options = {}) {
        this.defaultOptions = {
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
                "decrase trait",
                "increase police",
                "decrease police",
                "save",
                "video",
                "image",
            ],
        };

        //* Sauvegarde automatiquement le contenu toutes les 30 secondes
        setInterval(() => {
            this.saveContent();
            console.log("La sauvegarde automatique a été effectuée.");
        }, 30000);

        this.options = { ...this.defaultOptions, ...options };
        this.element = element;

        this.loadContent();

        this.initialize();
    }

    initialize() {
        this.createToolbar();

        this.element.addEventListener("input", () => {
            this.handleInput();
        });

        //* Événement avant le déchargement de la page
        window.addEventListener("beforeunload", (event) => {
            const contentDiv = this.element.nextElementSibling;
            const localContent = localStorage.getItem("content");

            if (contentDiv.innerHTML !== localContent) {
                const confirmationMessage =
                    "Le contenu du fichier a été modifié. Voulez-vous le sauvegarder avant de quitter ?";
                event.returnValue = confirmationMessage;
                return confirmationMessage;
            }
        });

        //* Événement de déchargement de la page
        window.addEventListener("unload", () => {
            const contentDiv = this.element.nextElementSibling;
            this.saveContent();
        });
    }

    //* Méthode pour crée la barre d'outils
    createToolbar() {
        const toolbar = document.createElement("div");
        toolbar.classList.add("wysiwyg-toolbar");

        this.options.buttons.forEach((buttonType) => {
            const button = document.createElement("button");
            button.classList.add("wysiwyg-button");
            button.textContent = buttonType;

            if (buttonType.toLowerCase() === "switch") {
                button.classList.add("switch");
            }

            if (buttonType.toLowerCase() === "save") {
                button.addEventListener("click", () => {
                    this.saveContent();
                });
            } else {
                button.addEventListener("click", () => {
                    this.handleButtonClick(buttonType);
                });
            }

            toolbar.appendChild(button);
        });

        this.element.parentElement.insertBefore(toolbar, this.element);
    }

    //* Méthode pour gérer les sauts de ligne et les retours à la ligne
    handleEnterKey(event) {
        event.preventDefault();

        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const newParagraph = document.createElement("p");
        range.insertNode(newParagraph);

        range.setStartAfter(newParagraph);
        range.setEndAfter(newParagraph);
        selection.removeAllRanges();
        selection.addRange(range);
    }

    //* Méthode pour sélectionner le texte afin de pouvoir sélectionner précisément la plage de texte à modifier
    selectText(element) {
        const range = document.createRange();
        range.selectNodeContents(element);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    }

    //* Méthode pour mettre le texte en gras
    makeTextBold() {
        const selection = window.getSelection();
        if (selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        const selectedText = range.toString().trim();

        if (selectedText.length === 0) return;

        const parentElement = range.commonAncestorContainer.parentElement;

        const isAlreadyBold = parentElement.nodeName === "STRONG";

        if (isAlreadyBold) {
            const textNode = document.createTextNode(parentElement.innerText);
            parentElement.replaceWith(textNode);
            this.selectText(textNode);
        } else {
            const boldElement = document.createElement("strong");
            boldElement.appendChild(document.createTextNode(selectedText));

            range.deleteContents();
            range.insertNode(boldElement);

            this.selectText(boldElement);
        }
    }

    //* Méthode pour mettre le texte en italique
    makeTextItalic() {
        const selection = window.getSelection();
        if (selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        const selectedText = range.toString().trim();

        if (selectedText.length === 0) return;

        const parentElement = range.commonAncestorContainer.parentElement;
        if (parentElement.nodeName === "EM") {
            const textNode = document.createTextNode(parentElement.innerText);
            parentElement.replaceWith(textNode);
            this.selectText(textNode);
        } else {
            const italicElement = document.createElement("em");
            italicElement.appendChild(range.extractContents());
            range.insertNode(italicElement);
            this.selectText(italicElement);
        }
    }

    //* Méthode pour barrer le texte
    makeTextStrikethrough() {
        const selection = window.getSelection();
        if (selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        const selectedText = range.toString().trim();

        if (selectedText.length === 0) return;

        const parentElement = range.commonAncestorContainer.parentElement;
        if (parentElement.nodeName.toLowerCase() === "s") {
            const textNode = document.createTextNode(parentElement.innerText);
            parentElement.replaceWith(textNode);
            this.selectText(textNode);
        } else {
            const strikethroughElement = document.createElement("s");
            strikethroughElement.appendChild(range.extractContents());
            range.insertNode(strikethroughElement);
            this.selectText(strikethroughElement);
        }
    }

    //* Méthode pour changer la couleur du texte.
    makeTextColor() {
        const selection = window.getSelection();
        if (selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        const selectedText = range.toString().trim();

        const colorElement = document.createElement("span");

        const colorInput = document.createElement("input");
        colorInput.type = "color";

        colorInput.addEventListener("change", () => {
            colorElement.style.color = colorInput.value;

            colorInput.remove();
        });

        colorElement.appendChild(colorInput);
        colorElement.appendChild(document.createTextNode(selectedText));

        range.deleteContents();
        range.insertNode(colorElement);

        this.selectText(colorElement);

        colorInput.click();
    }

    //* Méthode pour créer un lien vers une page web.
    makeLink() {
        const link = window.prompt("Veuillez entrer le lien");

        if (!link) return;

        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const selectedText = range.toString().trim();

        const linkElement = document.createElement("a");
        linkElement.href = link;
        linkElement.target = "_blank";

        if (selectedText.length > 0) {
            linkElement.textContent = selectedText;
            range.deleteContents();
        } else {
            linkElement.textContent = link;
        }

        range.insertNode(linkElement);
        this.selectText(linkElement);

        linkElement.addEventListener("click", (event) => {
            event.preventDefault();
            linkElement.style.cursor = "pointer";
            window.open(linkElement.href, "_blank");
        });
    }

    //* Méthode pour aligner le texte à gauche.
    makeTextLeft() {
        this.applyTextAlignment("left");
    }

    //* Méthode pour aligner le texte à droite.
    makeTextRight() {
        this.applyTextAlignment("right");
    }

    //* Méthode pour aligner le texte au centre.
    makeTextCenter() {
        this.applyTextAlignment("center");
    }

    //* Méthode pour justifier le texte.
    makeTextJustify() {
        this.applyTextAlignment("justify");
    }

    //* Méthode pour appliquer l'alignement du texte.
    applyTextAlignment(alignment) {
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);

        const selectedText = range.toString().trim();
        if (selectedText.length > 0) {
            const textContainer = document.createElement("div");
            textContainer.appendChild(document.createTextNode(selectedText));
            textContainer.style.textAlign = alignment;

            range.deleteContents();
            range.insertNode(textContainer);

            this.selectText(textContainer);
        } else {
            const startContainer = range.startContainer;
            const paragraph = this.getContainingParagraph(startContainer);

            if (paragraph) {
                paragraph.style.textAlign = alignment;
            }
        }
    }

    //* Methde pour basculer entre le mode code et le mode WYSIWYG.
    switchMode() {
        const contentEditableDiv = this.element.nextElementSibling;
        const textarea = this.element;

        if (this.isCodeView) {
            const textContent = textarea.value;
            const htmlContent = this.encodeHTML(textContent);
            contentEditableDiv.innerHTML = htmlContent;
            textarea.value = htmlContent;
        } else {
            const htmlContent = contentEditableDiv.innerHTML;
            const decodedContent = this.decodeHTML(htmlContent);
            textarea.value = decodedContent;
            contentEditableDiv.innerHTML = this.encodeHTML(decodedContent);
        }
    }

    //* Méthode pour encoder le contenu HTML.
    encodeHTML(text) {
        const textarea = document.createElement("textarea");
        textarea.textContent = text;
        return textarea.innerHTML;
    }

    //* Méthode pour decoder le contenu HTML.
    decodeHTML(html) {
        const textarea = document.createElement("textarea");
        textarea.innerHTML = html;
        return textarea.value;
    }

    //* Méthode pour augmenter l'épaisseur du trait.
    augmentTrait() {
        console.log("augmentTrait called");
        this.adjustStrikeThrough("increase");
    }

    //* Méthode pour diminuer l'épaisseur du trait.
    lowerTrait() {
        console.log("lowerTrait called");
        this.adjustStrikeThrough("decrease");
    }

    //* Méthode pour ajuster l'épaisseur du trait.
    adjustStrikeThrough(action) {
        const selection = window.getSelection();
        if (selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        const selectedText = range.toString().trim();

        const parentElement = range.commonAncestorContainer.parentElement;
        if (parentElement.nodeName.toLowerCase() === "s") {
            const computedStyle = window.getComputedStyle(parentElement);
            const currentThickness =
                parseFloat(
                    computedStyle.getPropertyValue("text-decoration-thickness")
                ) || 2;

            let newThickness;
            if (action === "increase") {
                newThickness = currentThickness * 1.1;
            } else {
                newThickness = currentThickness * 0.9;
            }

            parentElement.style.textDecorationThickness = `${newThickness}px`;
        }
    }

    //* Méthode pour augmenter la taille de la police.
    increasePolice() {
        this.adjustFontSize("increase");
    }

    //* Méthode pour diminuer la taille de la police.
    decreasePolice() {
        this.adjustFontSize("decrease");
    }

    //* Méthode pour ajuster la taille de la police.
    adjustFontSize(action) {
        const selection = window.getSelection();
        if (selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        const selectedText = range.toString().trim();

        const parentElement = range.commonAncestorContainer.parentElement;
        if (selectedText.length > 0 && parentElement) {
            const computedStyle = window.getComputedStyle(parentElement);
            const currentSize = parseFloat(
                computedStyle.getPropertyValue("font-size")
            );

            let newSize;
            if (action === "increase") {
                newSize = currentSize * 1.1;
            } else {
                newSize = currentSize * 0.9;
            }

            parentElement.style.fontSize = `${newSize}px`;
        }
    }

    //* Méthode pour sauvegarder le contenu dans le localStorage
    saveContent() {
        const contentDiv = this.element.nextElementSibling;
        localStorage.setItem("content", contentDiv.innerHTML);
    }

    //* Méthode pour charger le contenu depuis le localStorage
    loadContent() {
        const contentDiv = this.element.nextElementSibling;
        const storedContent = localStorage.getItem("content");

        if (storedContent) {
            contentDiv.innerHTML = storedContent;
        }
    }

    //* Méthode pour insérer une vidéo
    insertVideo() {
        const videoUrl = window.prompt(
            "Ajouter un lien video(YouTube ou Dailymotion)"
        );

        if (!videoUrl) return;

        const selection = window.getSelection();
        const range = selection.getRangeAt(0);

        const videoContainer = document.createElement("div");
        const videoIframe = document.createElement("iframe");

        if (videoUrl.includes("youtube.com")) {
            const videoId = videoUrl.split("v=")[1];
            videoIframe.src = `https://www.youtube.com/embed/${videoId}`;
        } else if (videoUrl.includes("dailymotion.com")) {
            const videoId = videoUrl.split("/video/")[1];
            videoIframe.src = `https://www.dailymotion.com/embed/video/${videoId}`;
        } else {
            alert("Lien invalide. Veuillez entrer un lien valide");
            return;
        }

        videoIframe.width = "560";
        videoIframe.height = "315";

        videoContainer.appendChild(videoIframe);

        range.deleteContents();
        range.insertNode(videoContainer);

        this.selectText(videoContainer);
    }

    //* Méthode pour insérer une image
    insertImage() {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";

        input.addEventListener("change", (event) => {
            const file = event.target.files[0];

            if (file) {
                const reader = new FileReader();

                reader.onload = () => {
                    const imageUrl = reader.result;

                    const selection = window.getSelection();
                    const range = selection.getRangeAt(0);

                    const imageElement = document.createElement("img");
                    imageElement.src = imageUrl;

                    imageElement.style.maxWidth = "300px";
                    imageElement.style.maxHeight = "300px";

                    range.deleteContents();
                    range.insertNode(imageElement);

                    this.selectText(imageElement);
                };

                reader.readAsDataURL(file);
            }
        });

        input.click();
    }

    //* Méthode pour attribuer une action à un bouton
    handleButtonClick(buttonType) {
        switch (buttonType) {
            case "bold":
                this.makeTextBold();
                break;
            case "italic":
                this.makeTextItalic();
                break;
            case "strikethrough":
                this.makeTextStrikethrough();
                break;
            case "color":
                this.makeTextColor();
                break;
            case "lien":
                this.makeLink();
                break;
            case "text-left":
                this.makeTextLeft();
                break;
            case "text-right":
                this.makeTextRight();
                break;
            case "text-center":
                this.makeTextCenter();
                break;
            case "text-justify":
                this.makeTextJustify();
                break;
            case "switch":
                this.switchMode();
                break;
            case "increase trait":
                this.augmentTrait();
                break;
            case "decrease trait":
                this.lowerTrait();
                break;
            case "increase police":
                this.increasePolice();
                break;
            case "decrease police":
                this.decreasePolice();
                break;
            case "save":
                this.saveContent();
                break;
            case "video":
                this.insertVideo();
                break;
            case "image":
                this.insertImage();
                break;
        }
    }
}
