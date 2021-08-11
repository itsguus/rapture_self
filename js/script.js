// ----------------DEV MODE-----------------------------------------------
const devMode = false;
if (devMode) {
    document.body.classList.add("loaded");
    document.querySelector("div.loading").style = "display: none;"
}
//  else
//     removeLoadingScreen();


// ----------------GLOBAL VARIABLES---------------------------------------
let homePage = false,
    portfolioPage = false,
    projectPage = false,
    currentVideo,
    currentVideoTimer;

if (document.body.classList.contains("home")) homePage = true;
else if (document.body.classList.contains("projects")) portfolioPage = true;
else if (document.body.classList.contains("project")) projectPage = true;

const mouseBoundaries = {
    x: 20, // offset in % from the middle
    y: 65 // so this / 4 on both sides to get 100%; 
},
    animationTime = 1000, // globally used
    mouseCursor = document.querySelector("#fakemouse");



// ----------------FUNCTIONS ---------------------------------------
function removeLoadingScreen() {
    document.body.classList.add("loaded");
}

function collapseArticle(el) {
    if (!el.classList.contains('animating')) {
        el.classList.add("animating")
        {
            const collapsed = el.getAttribute('data-collapsed'),
                articles = document.querySelectorAll('article .content');
            if (collapsed == 0) {
                articles.forEach(article => {
                    const articleHeight = article.offsetHeight;
                    article.parentNode.classList.add("collapsed")
                    article.setAttribute("data-height", articleHeight);
                    article.parentNode.querySelector("span").setAttribute("data-collapsed", 1);
                    article.style = "height: 0";

                    const span = article.parentNode.querySelector('span'),
                        h2 = article.parentNode.querySelector('h2');
                    h2.style = `margin-top: ${articleHeight}px`;
                    span.style = `margin-top: ${articleHeight}px`;
                })
            }
            else {

                articles.forEach(article => {
                    const articleHeight = article.getAttribute("data-height");
                    article.style = `height: ${articleHeight}px`;
                    article.parentNode.classList.remove("collapsed");
                    article.parentNode.querySelector("span").setAttribute("data-collapsed", 0);
                });
            }
        }
        setTimeout(() => { el.classList.remove("animating") }, 500);
    }
}

function setHeight(el) {
    const height = el.offsetHeight
    el.style = `height: ${height}px`;
}

function playVideo(el) {
    const pos = el.getAttribute("data-pos");
    currentVideo = players[pos];
    players[pos].getDuration().then(function (videoLength) {

        currentVideo.unload();
        currentVideo.play();

        clearTimeout(currentVideoTimer);
        currentVideoTimer = setTimeout(() => {
            nextProject();
        }, videoLength * 1000); // ms to s

        const cls = el.getAttribute("data-for"),
            allAnimatedEls = document.querySelectorAll(".an"),
            necessaryAnimatedEls = document.querySelectorAll(`.${cls} .an`);

        allAnimatedEls.forEach(el => { el.style = `transition: 500ms ease`; });

        necessaryAnimatedEls.forEach(el => {
            el.style = `transition:${videoLength}s linear`;
            if (el.tagName == "circle") el.style = `transition: stroke-dashoffset ${videoLength}s linear`
        });

        document.querySelectorAll(`.progress`).forEach((el) => { el.classList.remove('active'); });
        document.querySelector(`.${cls}.progress`).classList.add('active');
        document.querySelector("#fakemouse").classList.remove("fakehover");
    })
}

function startFirstVideo() {
    const firstInput = document.querySelector(".progressbox > input[type=radio]"),
        firstVideoBox = document.querySelector("section.project figure .img");
    firstVideoBox.classList.add("front");
    firstInput.checked = true;
    players[0].ready().then(() => { removeLoadingScreen(); })
    playVideo(firstInput);
}

function startFirstVideoAlt() {
    const iframe = document.querySelector("iframe");
    var player = new Vimeo.Player(iframe);
    player.ready().then(() => { removeLoadingScreen(); })
}

function cursorCheck(e, x, y, click) {
    const xTotal = window.innerWidth,
        yTotal = window.innerHeight,
        yPerc = y / yTotal * 100,
        xPerc = x / xTotal * 100,
        yBoundaries = {
            min: mouseBoundaries.y / 4,
            max: 100 - (mouseBoundaries.y / 4)
        }; // min; max



    if (e.target.classList && !e.target.classList.contains("arrow--possible")) {
        resetMouse();
        return;
    }
    if (yPerc > yBoundaries.min && yPerc < yBoundaries.max) {
        const xBoundaries = {
            left: {
                min: 0,
                max: 50 - mouseBoundaries.x
            },
            right: {
                min: 50 + mouseBoundaries.x,
                max: 100
            }
        }

        if (xPerc > xBoundaries.left.min && xPerc < xBoundaries.left.max) {
            // arrow left
            mouseCursor.classList.remove("right");
            mouseCursor.classList.add("left");
            if (click) previousProject(e);
        }

        else if (xPerc > xBoundaries.right.min && xPerc < xBoundaries.right.max) {
            // arrow right
            mouseCursor.classList.remove("left");
            mouseCursor.classList.add("right");
            if (click) nextProject(e);
        }
        else if (xPerc > xBoundaries.left.max && xPerc < xBoundaries.right.min) {
            resetMouse();
        }
    }
    else if (yPerc < yBoundaries.min || yPerc > yBoundaries.max) {
        resetMouse();
    }
}

function resetMouse() {
    mouseCursor.classList.remove("left");
    mouseCursor.classList.remove("right");
}

function nextProject() {
    const fig = document.querySelector("section.project > figure");
    if (!fig.classList.contains("animating")) {
        fig.classList.add("animating");
        { // when not animating
            moveImages("right");
            moveArticles("right");
            setVideo();
        }
        setTimeout(() => { fig.classList.remove("animating") }, animationTime);
    }
}

function previousProject() {
    const fig = document.querySelector("section.project > figure");
    if (!fig.classList.contains("animating")) {
        fig.classList.add("animating");
        { // when not animating
            moveImages("left");
            moveArticles("left");
            setVideo();
        }
        setTimeout(() => { fig.classList.remove("animating") }, animationTime);
    }
}

function setProject(el) {
    const pos = el.getAttribute("data-pos");
    moveImages(pos);
    moveArticles(pos);
    playVideo(el);
}



function moveImages(dir) {
    const allImages = document.querySelectorAll("section.project figure .img"),
        slider = document.querySelector("figure div.slider");
    let oldIndex = slider.getAttribute('data-pos'), newIndex;
    if (dir == "right") {
        newIndex = parseInt(oldIndex) - 1;
        if (newIndex < (allImages.length - 1) * -1) newIndex = 0;
    }
    else if (dir == "left") {
        newIndex = parseInt(oldIndex) + 1;
        if (newIndex > 0) newIndex = (allImages.length - 1) * -1;
    }
    else { // index given
        newIndex = parseInt(dir * -1);
    }
    slider.style = `transform: translate3d(${newIndex * 100}%,0,0);`
    slider.setAttribute("data-pos", newIndex);
    setCorrectImgFront(allImages, -newIndex);
}

function setCorrectImgFront(allImages, newIndex) {
    allImages.forEach((img) => {
        img.classList.remove("front");
    });
    allImages[newIndex].classList.add("front");
}

function moveArticles(dir) {
    const allArticles = document.querySelectorAll("section.project .narrow article"),
        slider = document.querySelector(".narrow div.slider");
    let oldIndex = slider.getAttribute('data-pos'), newIndex;
    if (dir == "right") {
        newIndex = parseInt(oldIndex) - 1;
        if (newIndex < (allArticles.length - 1) * -1) newIndex = 0;
    }
    else if (dir == "left") {
        newIndex = parseInt(oldIndex) + 1;
        if (newIndex > 0) newIndex = (allArticles.length - 1) * -1;
    }
    else { // index given
        newIndex = parseInt(dir * -1);
    }
    slider.style = `transform: translate3d(calc(${newIndex * 100}% + ${newIndex * 2}rem),0,0);`
    slider.setAttribute("data-pos", newIndex);
}

function setVideo() {
    const pos = Math.abs(document.querySelector(".slider").getAttribute("data-pos")),
        radios = document.querySelectorAll(".progressbox input");
    playVideo(radios[pos]);
}

function runFilter() {
    const checkedFilterNodes = document.querySelectorAll(".filters input:checked"),
        allProjects = document.querySelectorAll("ul.grid > li");

    if (checkedFilterNodes.length === 0) {
        for (const project of allProjects) {
            project.classList.add("active");
        }
        return;
    }

    for (const project of allProjects) {
        project.classList.remove('active');
        for (const node of checkedFilterNodes) {
            const filter = node.getAttribute("data-for");
            if (project.classList.contains(filter)) {
                project.classList.add("active");
            }
        }
    }
}



function changeFavicon(counter) {
    counter++;
    if (counter > 3) counter = 1;
    document.querySelectorAll("link.favicon").forEach((link) => {
        link.setAttribute("href", `/img/icon-196x196-${counter}.png`)
    })

    setTimeout(() => {
        changeFavicon(counter)
    }, animationTime * 3);
}

function resizeIFrame() {
    const w = window.innerWidth,
        h = window.innerHeight,
        allDivs = document.querySelectorAll(".img .resize"),
        appBreakPointWidth = 500;
    if (w < appBreakPointWidth) return;
    var scale = 1,
        aspectRatioBrowser = w / h;
    aspectRatio = 16 / 9;
    extraScaleMobile = 1.4;
    if (aspectRatioBrowser < 1) { // gives white border at the bottom
        scale = (scale + (aspectRatio - aspectRatioBrowser)) * extraScaleMobile;
    }
    else if (aspectRatioBrowser < aspectRatio && aspectRatioBrowser >= 1) {
        scale = scale + (aspectRatio - aspectRatioBrowser);
    }
    allDivs.forEach((div) => {
        div.style = `transform: scale(${scale});`
    });
}

// ----------------FAKE MOUSE EVENTS------------------------------------
window.addEventListener("mousemove", (e) => {
    const x = e.clientX;
    const y = e.clientY;
    mouseCursor.style = `transform: translate3d(${x}px,${y}px,0)`;
    if (homePage) cursorCheck(e, x, y, false) // for arrow animations
})

window.addEventListener("click", (e) => {
    const x = e.clientX;
    const y = e.clientY;
    if (homePage) cursorCheck(e, x, y, true) // for arrow animations
})


document.querySelectorAll('.fakehover').forEach((el) => {
    el.addEventListener("mouseenter", (e) => {
        if (e.target.nextElementSibling && e.target.nextElementSibling.classList.contains("active")) return;
        document.querySelector("#fakemouse").classList.add("fakehover");
        
        if(e.target.classList.contains("showText")) document.querySelector("#fakemouse .fullvideo").classList.add("show");
    });
    el.addEventListener("mouseleave", () => {
        document.querySelector("#fakemouse").classList.remove("fakehover");
        document.querySelector("#fakemouse .fullvideo").classList.remove("show");
    });
});

// ----------------FULL PORTFOLIO FUNCTIONS------------------------------------

function setUlWidths() {
    let uls = document.querySelectorAll(".overflower .row ul");
    for (const ul of uls) {
        const listItems = ul.querySelectorAll('li');
        let totalWidth = 0;
        for (const li of listItems) {
            const w = li.offsetWidth + 200;
            totalWidth += w;
        }
        // ul.style = `width: ${totalWidth}px`
        ul.parentNode.parentNode.style = `width: ${totalWidth * 2}px;`
    }
}

function setGradHeight() {
    const vh = window.innerHeight,
        docHeight = document.body.offsetHeight,
        perc = parseInt(vh / docHeight * 100);
    var max = 100,
        color = "#b0b0a1"
    if (projectPage) {
        max = 150;
        color = "#fff"
    }
    document.querySelector(".grad").style = `height: ${docHeight}px; background: linear-gradient(180deg, transparent 0%, ${color} ${perc}%, #000 ${max}%)`;
}

function footerInterval(counter) {
    counter++;
    if (counter > 2) {
        counter = -1;
    }
    const listItems = document.querySelectorAll('footer ul > li:nth-of-type(2) > ul > li');
    listItems.forEach(li => {
        li.classList.remove("banked");
    })
    if (counter >= 0) listItems[counter].classList.add("banked");
    setTimeout(() => {
        footerInterval(counter);
    }, 2000);
}

// ----------------HOMEPAGE FUNCTIONS----------------------------------
function intersectObserveText() {
    let options = {
        root: document.querySelector('#scrollArea'),
        rootMargin: '0px',
        threshold: 1.0
    }

    let callback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("show");
            }
            else entry.target.classList.remove("show");
        });
    };
    let observer = new IntersectionObserver(callback, options);
    let target = document.querySelector('div.md');
    observer.observe(target);
}


function scrollFunction() {
    const y = window.scrollY,
        threshold = 100;
    addOrRemoveClassAfter(y, threshold, document.body, "scrolled");
}

function addOrRemoveClassAfter(y, thresholdInPx, node, className) {
    if (y < thresholdInPx && node.classList.contains(className)) node.classList.remove(className);
    else if (y >= thresholdInPx && !node.classList.contains(className)) node.classList.add(className);
}

function setProjectArrowListeners() {
    const hoverRegion = document.querySelector("section.related");
    hoverRegion.addEventListener("mousemove", (e) => {
        if (e.target.classList.contains("left")) {
            mouseCursor.classList.remove("right");
            mouseCursor.classList.add("left");
        }
        else if (e.target.classList.contains("right")) {
            mouseCursor.classList.remove("left");
            mouseCursor.classList.add("right");
        }
        else resetMouse();
    });

    hoverRegion.addEventListener("mouseleave", resetMouse);
}

function slideProjects(el, direction) { // direction -1 is left, 1 is right. 
    var ul = el.parentNode.querySelector(".slider ul");
    if (!ul.classList.contains("animating")) {
        ul.classList.add("animating");
        {
            const lis = ul.querySelectorAll("li.fakehover");
            let pos = parseInt(ul.getAttribute('data-pos'));
            const maxSlide = (lis.length - 2) * -1,
                minSlide = 0;

            pos = pos + direction;

            if (pos < maxSlide || pos > minSlide) {
                shake(ul, pos, direction)
                setTimeout(() => { ul.classList.remove("animating") }, 500)
                return;
            }

            const transXperc = 50 * pos,
                transXrem = 0.5 * pos;
            ul.setAttribute('data-pos', pos);
            ul.style = `transform: translate3d(calc(${transXperc}% + ${transXrem}rem), 0, 0);`;
        }
        setTimeout(() => { ul.classList.remove("animating") }, 500)
    }
}

function shake(el, pos, direction) {
    if (direction > 0) { // shake left
        el.style = `transform: translate3d(1.5%, 0,0)`
        setTimeout(() => { el.style = `transform:translate3d(0,0,0);` }, 250);
    }
    else {
        
        el.style = `transform: translate3d(calc(${(pos + 1) * 50 - 1.5}% + ${(pos + 1) * 0.5}rem), 0, 0);`
        setTimeout(() => { el.style = `transform: translate3d(calc(${(pos + 1) * 50}% + ${(pos + 1) * 0.5}rem), 0, 0);` }, 250);
    }
}


// ----------------ALL PAGES FUNCTION CALLS----------------------------------
// changeFavicon(1);
window.addEventListener("touchstart", () => {
    document.body.classList.add("mobile");
});


// ----------------HOMEPAGE FUNCTION CALLS----------------------------------
if (homePage) {
    const iframes = document.querySelectorAll("section.project .slider .img iframe");
    var players = [];
    players[0] = new Vimeo.Player(iframes[0]);
    players[1] = new Vimeo.Player(iframes[1]);
    players[2] = new Vimeo.Player(iframes[2]);

    let loaded = false;
    window.onload = () => {
        if (!loaded) {
            startFirstVideo();
            loaded = true;
        }
    }

    document.querySelectorAll(".narrow article .content").forEach(article => {
        setHeight(article);
    });

    document.addEventListener("keydown", (e) => {
        if (e.key == "ArrowRight") nextProject();
        else if (e.key == "ArrowLeft") previousProject();
        else if (e.key == "ArrowDown" || e.key == "ArrowUp") {
            const article = document.querySelector('.articles article'),
                collapsed = article.querySelector("span").getAttribute("data-collapsed");
            if (e.key == "ArrowDown" && collapsed == 0 || e.key == "ArrowUp" && collapsed == 1) collapseArticle(document.querySelector('article .btn.fakehover'));
        }
    });

    window.addEventListener("resize", resizeIFrame);
    resizeIFrame();
}

// --------------- FULL PORTFOLIO PAGE & PROJECT PAGE FUNCTION CALLS----------------------------------

if (portfolioPage || projectPage) {
    startFirstVideoAlt();
    footerInterval(0);
    window.addEventListener("resize", () => {
        setGradHeight();
        resizeIFrame();
    });
    setTimeout(() => { setGradHeight(); }, 100);
    resizeIFrame();
}

// --------------- FULL PORTFOLIO PAGE FUNCTION CALLS----------------------------------
if (portfolioPage) {
    window.addEventListener("resize", () => {
        setUlWidths();
    });
    setUlWidths();
}

// --------------- PROJECT PAGE FUNCTION CALLS----------------------------------
if (projectPage) {
    window.addEventListener("scroll", scrollFunction);
    scrollFunction();
    intersectObserveText();
    setProjectArrowListeners();
}


