import { db } from "./firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

//#region Fields 
let currentScale = 1.0; // Initial scale for the image

//#endregion

//#region Single Post 

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('id');
  
  if (!postId) {
    alert("No post ID provided!");
    return;
  }

  try {
    const postDoc = await getDoc(doc(db, "Posts", postId));
    
    if (postDoc.exists()) {
      const postData = postDoc.data();
      displayPost(postData.title, postData.content, postId);
      
      if (postData.imageUrls) {
        displayImages(postData.imageUrls);
      } 
    } else {
      alert("No such post!");
    }
  } catch (error) {
    console.error("Error fetching post:", error);
    alert("Error fetching post: " + error.message);
  }
});
function displayPost(title, content, postId) {
  const postContent = document.getElementById('post-content');

  const titleElement = document.createElement('h1');
  titleElement.textContent = title;
  
  const contentElement = document.createElement('div');
  contentElement.innerHTML = content; // Use innerHTML to render the rich text

  EditButton(postId);
  AddDownloadButton(title, content);

  // Append title and content to page
  postContent.appendChild(titleElement);
  postContent.appendChild(contentElement);  
}
function displayImages(imageUrls = []) {  
  const postContent = document.getElementById('post-content');
  const galleryContainer = document.createElement('div');
  galleryContainer.classList.add('gallery-container');
  
  imageUrls.forEach(url => {
    const img = document.createElement('img');
    img.src = url;
    img.classList.add('post-image');
    
    // Add click event listener to expand image
    img.addEventListener('click', () => {
      expandImage(img.src);
    });
    
    galleryContainer.appendChild(img);
  });
  
  postContent.appendChild(galleryContainer);
}
function expandImage(imageUrl) {
  const overlay = document.createElement('div');
  overlay.classList.add('overlay');
  
  const imageElement = document.createElement('img');
  imageElement.src = imageUrl;
  imageElement.classList.add('expanded-image');
  // Set initial scale
  imageElement.style.transform = `scale(${currentScale})`; 
  
  //Add zoom controls
  const zoomControls = document.createElement('div');
  zoomControls.classList.add('zoom-controls');
  
  //Zoom In
  const zoomInButton = document.createElement('button');
  zoomInButton.textContent = '+';
  zoomInButton.classList.add('zoom-button');
  zoomInButton.addEventListener('click', () => {
    event.stopPropagation();
    currentScale += 0.4; // Increase scale by 0.1
    imageElement.style.transform = `scale(${currentScale})`;
  });

  //Zoom Out
  const zoomOutButton = document.createElement('button');
  zoomOutButton.textContent = '-';
  zoomOutButton.classList.add('zoom-button');
  zoomOutButton.addEventListener('click', () => {
    event.stopPropagation();
    currentScale -= 0.4; // Decrease scale by 0.1
    imageElement.style.transform = `scale(${currentScale})`;
  });

  zoomControls.appendChild(zoomInButton);
  zoomControls.appendChild(zoomOutButton);

  overlay.appendChild(imageElement);
  overlay.appendChild(zoomControls);
  document.body.appendChild(overlay);
  
  overlay.addEventListener('click', () => {
    overlay.remove();
    // reset to normal 
    currentScale = 1.0; 
  });
}
function EditButton(postId) {
  // Edit the Post in a single page.
  const editButton = document.getElementById('edit-button');
  editButton.style.display = 'inline'; 

  editButton.addEventListener('click', () => {
    window.location.href = `edit.html?id=${postId}`;
  });
}
//#endregion

//#region Download Formats 
function AddDownloadButton(title, content) {
  const downloadButton = document.getElementById('download-button');

  downloadButton.addEventListener('click', () => {
    const format = prompt("Enter format (text, html, pdf):").toLowerCase();

    if (format ==='text') {
      downloadText(title, content);
    }


  });
}
function downloadText(title, content) {
  const element = document.createElement('a');
  const text = title + '\n\n' + content.replace(/<[^>]*>/g, ''); // Remove HTML tags
  const file = new Blob([text], { type: 'text/plain' });
  
  element.href = URL.createObjectURL(file);
  element.download = `${title}.txt`;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

//#endregion






