function removeLoadingScreen(el) {
    el.classList.add("loaded");
}

function collapseArticle(el) {
    const collapsed = el.getAttribute('data-collapsed'),
        article = el.parentNode.querySelector('.content');
    if (collapsed == 0) {
        const articleHeight = article.offsetHeight;
        article.parentNode.classList.add("collapsed")
        article.setAttribute("data-height", articleHeight);
        el.setAttribute("data-collapsed", 1);
        article.style = "height: 0";
    }
    else {
        const articleHeight = article.getAttribute("data-height");
        article.style = `height: ${articleHeight}px`;
        article.parentNode.classList.remove("collapsed");
        el.setAttribute("data-collapsed", 0);
    }
}



document.querySelectorAll(".narrow article .content").forEach(
    article => {
        setHeight(article);
    }
)
function setHeight(el) {
    const height = el.offsetHeight
    el.style = `height: ${height}px`;
}


var videoLength = 90; // seconds
function playVideo() {
    const animatedEls = document.querySelectorAll(".an");
    console.log(animatedEls);
    animatedEls.forEach(el => {
        el.style = `transition:${videoLength}s linear`;
    });
        document.querySelector(".progress").classList.add("active")
}

playVideo();