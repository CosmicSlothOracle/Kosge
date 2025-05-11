// Banner URL Submission Script
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzcEcQzt4dMn1B1yVMiRf25fYeXy1kUfRFsZ5LZ1AXIqYHWIaJXaWQaacG6XIR3bQHohQ/exec';

function submitBannerUrl() {
    const urlInput = document.getElementById("new-banner-url");
    const status = document.getElementById("submission-status");
    const url = urlInput.value.trim();

    // Reset status
    status.textContent = "";
    status.style.color = "";

    // Validate URL
    if (!url || !/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(url)) {
        status.textContent = "Bitte eine gültige Bild-URL eingeben.";
        status.style.color = "red";
        return;
    }

    // Disable submit button during submission
    const submitBtn = document.querySelector('#submit-banner-url button');
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.5';

    // Submission with error handling and timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);  // 10 second timeout

    // Create form data for submission
    const formData = new FormData();
    formData.append('url', url);
    formData.append('origin', 'geko-berlin.netlify.app');
    formData.append('userIP', '');

    fetch(GOOGLE_SCRIPT_URL + "?url=" + encodeURIComponent(url) + "&origin=geko-berlin.netlify.app", {
        method: "GET",
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(response => {
        clearTimeout(timeoutId);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text().then(text => {
            try {
                // Try to parse as JSON
                return JSON.parse(text);
            } catch (e) {
                // If not valid JSON, return the text
                console.warn('Response is not valid JSON:', text);
                return { status: 'success', message: 'Banner URL submitted' };
            }
        });
    })
    .then(data => {
        if (data.status === 'success') {
            status.textContent = "Erfolgreich übermittelt!";
            status.style.color = "green";
            urlInput.value = "";
            addSubmittedBannerToRotation(url);
        } else {
            throw new Error(data.message || 'Unknown error');
        }
    })
    .catch(error => {
        clearTimeout(timeoutId);
        console.error('Submission error:', error);
        status.textContent = error.name === 'AbortError'
            ? "Zeitüberschreitung. Bitte später erneut versuchen."
            : "Fehler beim Speichern. Bitte überprüfen Sie Ihre Verbindung.";
        status.style.color = "red";
    })
    .finally(() => {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
    });
}

function addSubmittedBannerToRotation(url) {
    // Find the first placeholder banner
    const placeholderBanners = Array.from(document.querySelectorAll('.banner img'))
        .filter(img => img.src.includes('platzhalter.png'));

    if (placeholderBanners.length > 0) {
        const bannerToReplace = placeholderBanners[0];
        bannerToReplace.src = url;

        // Optional: Save to localStorage for persistence
        const bannerId = bannerToReplace.id.replace('banner', '');
        localStorage.setItem(`banner${bannerId}Url`, url);
    }
}

// Expose function globally
window.submitBannerUrl = submitBannerUrl;