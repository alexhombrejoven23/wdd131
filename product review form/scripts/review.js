function updateReviewCounter() {
    let reviewCount = localStorage.getItem('reviewCount');

    if (reviewCount === null) {
        reviewCount = 0;
    } else {
        reviewCount = parseInt(reviewCount);
    }

    reviewCount++;

    localStorage.setItem('reviewCount', reviewCount);

    const reviewCountElement = document.getElementById('reviewCount');
    if (reviewCountElement) {
        reviewCountElement.textContent = reviewCount;
    }
}

function updateLastModified() {
    const lastModifiedElement = document.getElementById('lastModified');
    if (lastModifiedElement) {
        const lastModified = new Date(document.lastModified);
        lastModifiedElement.textContent = lastModified.toLocaleString();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    updateReviewCounter();
    updateLastModified();
});