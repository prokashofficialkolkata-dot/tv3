const GITHUB_OWNER = "prokashofficialkolkata-dot";
const GITHUB_REPO = "tv-digital-signage";
const IMAGE_FOLDER = "images";

async function uploadImages() {

    const files = document.getElementById("images").files;
    const message = document.getElementById("message");

    if (files.length === 0) {
        message.innerHTML = "Please select images";
        return;
    }

    message.innerHTML = "Uploading...";

    for (const file of files) {

        const base64 = await convertBase64(file);
        const fileName = Date.now() + "-" + file.name;

        await fetch(
            "https://api.github.com/repos/" + GITHUB_OWNER + "/" + GITHUB_REPO + "/dispatches",
            {
                method: "POST",
                headers: {
                    "Accept": "application/vnd.github+json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    event_type: "upload-image",
                    client_payload: {
                        filename: fileName,
                        image: base64.split(",")[1]
                    }
                })
            }
        );

    }

    message.innerHTML = "All images uploaded successfully";

    setTimeout(loadImages, 3000);
}

function convertBase64(file) {

    return new Promise((resolve, reject) => {

        const reader = new FileReader();

        reader.readAsDataURL(file);

        reader.onload = () => resolve(reader.result);

        reader.onerror = error => reject(error);

    });

}


// =============================
// Show Current Images
// =============================

async function loadImages() {

    const preview = document.getElementById("preview");

    preview.innerHTML = "Loading images...";

    const url =
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${IMAGE_FOLDER}`;

    const response = await fetch(url);

    const files = await response.json();
    console.log(files);

    // Sort images by page number
    files.sort((a, b) => {

        const numA = parseInt((a.name.match(/\d+/) || ["9999"])[0], 10);
        const numB = parseInt((b.name.match(/\d+/) || ["9999"])[0], 10);

        return numA - numB;

    });

    preview.innerHTML = "";
    console.table(files.map(f => f.name));
    files.forEach(file => {

        if (
            file.name.toLowerCase().endsWith(".jpg") ||
            file.name.toLowerCase().endsWith(".jpeg") ||
            file.name.toLowerCase().endsWith(".png")
        ) {

            let box = document.createElement("div");
            box.style.display = "inline-block";
            box.style.margin = "8px";
            box.style.textAlign = "center";

            let img = document.createElement("img");
            img.src = file.download_url;
            img.title = file.name;
            img.style.width = "120px";
            img.style.height = "80px";
            img.style.objectFit = "cover";
            img.style.borderRadius = "8px";
            img.style.display = "block";

            let name = document.createElement("div");
            name.innerHTML = file.name;
            name.style.fontSize = "12px";
            name.style.marginTop = "5px";
            name.style.color = "#fff";

            box.appendChild(img);
            box.appendChild(name);

            preview.appendChild(box);

        }

    });

}

// Load images when Admin Panel opens
loadImages();
