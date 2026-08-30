const baseURl = 'https://api.spacexdata.com/v3/rockets';
let url;
const searchForm = document.querySelector('form');
const searchTerm = document.querySelector('.search');
const para = document.createElement('p');
para.textContent = 'Keywords: '

searchForm.addEventListener('submit', fetchSpace);

function fetchSpace(e) {
    e.preventDefault();
    console.log("form was submitted");
    fetch(baseURl)
        .then(result => {
            console.log(result);
            return result.json();
        })
        .then(data => {
            // displayRockets(data);
            // console.log(data);
            rocketId(data)
            url = baseURL + searchTerm.value;
            console.log('URL', url);
        })
        .catch(err => console.log(err));
}


function rocketId(data) {
    console.log(data); // data[0]
    console.log(data[0]);
    const imgLink = data[0].flickr_images[6];
    console.log(imgLink);
    const imgLink2 = data[1].flickr_images[3];
    console.log(imgLink2);
    const imgLink3 = data[2].flickr_images[3];
    console.log(imgLink3);
    const imgLink4 = data[3].flickr_images[1];
    console.log(imgLink4);
    const body = document.getElementsByTagName('body')
    const img1 = document.createElement('img');
    img1.src = imgLink;
    const img2 = document.createElement('img');
    img2.src = imgLink2;
    const img3 = document.createElement('img');
    img3.src = imgLink3;
    const img4 = document.createElement('img');
    img4.src = imgLink4;
    body[0].appendChild(img1);
    body[0].appendChild(img2);
    body[0].appendChild(img3);
    body[0].appendChild(img4);
    // console.log(data[0].flickr_images);
    // console.log(data[0].flickr_images[1]);
    // data.forEach(element => {
    //     // const rocketInfo = element.description[0]
    //     const imgLink = element.flickr_images[0]
    //     // const imgLink2 = element.flickr_images[1]
    //     // console.log(rocketInfo);
    //     // const info = document.createElement('body')
    //     // img2.src = imgLink2;
    //     // info.src = rocketInfo;
    //     // body[0].appendChild(img2);
    //     body[0].appendChild(img3);
    //     body[0].appendChild(img4);
    //     // body[0].appendChild(info);
    // })
}