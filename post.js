import { db, auth, storage } from "./firebase.js";
import { addDoc, collection, deleteDoc, doc, getDocs, setDoc, Timestamp, getDoc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-storage.js";

//#region Post Functions

async function fetchAndDisplayPosts() {
  const blogPosts = document.getElementById('blog-posts');

  // Check if blogPosts is null or undefined
  if (!blogPosts) {
    throw new Error('Element with ID "blog-posts" not found.');
  }

  // Clear existing posts if needed
  blogPosts.innerHTML = '';

  try {
    const querySnapshot = await getDocs(collection(db, "Posts"));
    console.log("Fetched posts count:", querySnapshot.size); // Log number of fetched posts

    querySnapshot.forEach((doc) => {
      const postData = doc.data();
      const postElement = createPostElement(
        doc.id,
        postData.title,
        postData.content,
        postData.createdAt,
        postData.imageUrls,
        postData.collections
      );

      blogPosts.appendChild(postElement);
    });
  } catch (error) {
    throw new Error("Error fetching posts: " + error);
  }
}
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await fetchAndDisplayPosts();
  } catch (error) {
    alert("Error initializing: " + error.message);
  }
});
async function createPost(title, content, imageUrls = [], collections = []) {
  
  // FIREBASE Update
  // Create a new post with title, content, and timestamp
  try {
    const sanitizedTitle = title.replace(/[^a-zA-Z0-9]/g, '_');
    const postData = {
      title,
      content,
      imageUrls,
      collections,
      createdAt: Timestamp.now(), // Add a timestamp for creation date
      updatedAt: Timestamp.now()  // Also use the same timestamp for the last updated date initially
    };

    await setDoc(doc(db, "Posts", sanitizedTitle), postData); 
    return sanitizedTitle;
  } catch (error) {
    throw new Error("Error adding post: " + error);
  }
}
function createIconDeletePost(id) {
  const deleteIcon = document.createElement('button');
  deleteIcon.classList.add('delete-button');
  deleteIcon.innerHTML = '<i class="fa-solid fa-trash"></i>';

  deleteIcon.addEventListener('click', async (event) => {
    event.stopPropagation();
    await deletePost(id);
  });

  return deleteIcon;
}
async function deletePost(postId) {
  const confirmation = confirm("Are you sure you want to delete this post?");

  if (!confirmation) {
    return;
  }

  try {
    await deleteDoc(doc(db, "Posts", postId));
    //alert(`Post ${postId} deleted successfully!`);
    fetchAndDisplayPosts();
  } catch (error) {
    alert(`Error deleting post: ${error.message}`);
  }
}
function createEditButton(id) {
  const editButton = document.createElement('button');
  editButton.classList.add('edit-button');

  editButton.innerHTML = '<i class="fas fa-pencil-alt"></i>';

  editButton.addEventListener('click', (event) => {
    event.stopPropagation();
    window.location.href = `edit.html?id=${id}`;
  });

  return editButton;
}
function createAddButton(id) {
  const addButton = document.createElement('button');
  addButton.classList.add('add-button');
  addButton.innerHTML = '<i class="fa-solid fa-folder-plus"></i>';

  addButton.addEventListener('click', (event) => {
    event.stopPropagation(); // Prevent event from bubbling up
    toggleOverlay(addButton, id, true);
  });

  return addButton;
}
function toggleOverlay(parentElement, postId, fromAddButton = false) {
  const overlay = document.getElementById('collection-overlay');
  if (!overlay) return;

  // Clear existing content
  overlay.innerHTML = '';

  // Fetch collections (replace with actual dynamic data)
  const collections = ['Images', 'Ideas', 'Data', 'Inspiration', 'Creatures', 'Enemy'];
  collections.forEach(collection => {
    const collectionItem = document.createElement('div');
    collectionItem.classList.add('collection-item');
    collectionItem.textContent = collection;
    collectionItem.addEventListener('click', () => {
      movePostToCollection(postId, collection, fromAddButton);
      if (fromAddButton) {
        hideCollectionOverlay();
      }
    });
    overlay.appendChild(collectionItem);
  });

  const { right, top, height } = parentElement.getBoundingClientRect();
  overlay.style.left = `${right + 10}px`;
  overlay.style.top = `${top + window.scrollY + height / 2}px`; // Adjust vertical position based on the height of the icon
  overlay.style.display = 'block';

  // Close overlay if clicked outside
  document.addEventListener('click', function closeOverlay(event) {
    if (!parentElement.contains(event.target) && !overlay.contains(event.target)) {
      hideCollectionOverlay();
      document.removeEventListener('click', closeOverlay); // Remove the listener once overlay is closed
    }
  });
}
function hideCollectionOverlay() {
  const overlay = document.getElementById('collection-overlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
}
function createPostElement(id, title, content, createdAt, imageUrls = [], collections = []) {
  const postDiv = document.createElement('article');
  postDiv.classList.add('card__article');
  postDiv.dataset.id = id;

  const titleElement = document.createElement('h2');
  titleElement.classList.add('card__title');
  titleElement.textContent = title;

  const contentElement = document.createElement('div');
  contentElement.classList.add('card__description');
  contentElement.innerHTML = truncateAndSanitizeContent(content, 35);

  if (imageUrls.length > 0) {
    const imagesContainer = document.createElement('div');
    imagesContainer.classList.add('images-container');
    imageUrls.forEach(url => {
      const img = document.createElement('img');
      img.src = url;
      img.classList.add('mini-image');
      imagesContainer.appendChild(img);
    });
    postDiv.appendChild(imagesContainer);
  }

  const collectionsElement = document.createElement('div');
  collectionsElement.classList.add('card__collections');
  collectionsElement.textContent = `Collections: ${collections.join(', ')}`;

  collections.forEach(collection => {
    postDiv.classList.add(`collection-${collection.toLowerCase()}`);
  });

  const cardData = document.createElement('div');
  cardData.classList.add('card__data');

  cardData.appendChild(titleElement);
  cardData.appendChild(contentElement);
  cardData.appendChild(collectionsElement);

  postDiv.appendChild(cardData);

  const optionsLayer = document.createElement('div');
  optionsLayer.classList.add('options-layer');
  optionsLayer.appendChild(createIconDeletePost(id));
  optionsLayer.appendChild(createEditButton(id));
  optionsLayer.appendChild(createAddButton(id));

  postDiv.appendChild(optionsLayer);

  postDiv.addEventListener('click', () => {
    window.location.href = `post.html?id=${id}`;
  });

  return postDiv;
}
function truncateAndSanitizeContent(content, maxLength) {
  const doc = new DOMParser().parseFromString(content, 'text/html');
  const textContent = doc.body.textContent || "";
  return textContent.length > maxLength ? textContent.substring(0, maxLength) + '...' : textContent;
}
document.addEventListener('DOMContentLoaded', () => {
  const quill = new Quill('#editor', {
    theme: 'snow'
  });

  const postForm = document.getElementById('post-form');
  const blogPosts = document.getElementById('blog-posts');
  
  // Handle collection item selection
  document.querySelectorAll('.collection-item').forEach(item => {
    item.addEventListener('click', () => {
      item.classList.toggle('selected');
    });
  });

  postForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const title = event.target.title.value;
    const content = quill.root.innerHTML.trim(); // Get the HTML content from Quill
    console.log('Title:', title);
    console.log('Quill Content:', content); // Debugging: Log content
  
    const imageUrlsInput = event.target.imageUrls.value.trim();
    const imageUrls = imageUrlsInput ? imageUrlsInput.split(',') : [];
    const imageFiles = event.target.imageFiles.files;
    
    // Get selected collections
    const collections = Array.from(document.querySelectorAll('.collection-item.selected'))
      .map(item => item.getAttribute('data-value'));
    
    try {
      // Handle image file uploads
      const uploadedImageUrls = await handleImageUploads(imageFiles);
      const allImageUrls = [...imageUrls, ...uploadedImageUrls];
      
      // Add post to Firestore
      const postId = await createPost(title, content, allImageUrls, collections);
      
      // Update all posts 
      await fetchAndDisplayPosts();
      
      // Create and add post element to the DOM
      const postElement = createPostElement(postId, title, content, new Date(), allImageUrls, collections);
      blogPosts.insertBefore(postElement, blogPosts.firstChild);
        
      postForm.reset();
      quill.root.innerHTML = ''; // Reset Quill editor
      alert("Post added successfully!");
    } catch (error) {
      alert(error.message);
    }
  });
  
  // Fetch and display all posts on page load
  //fetchAndDisplayPosts();
});
async function handleImageUploads(files) {
  const imageUrls = [];

  for (const file of files) {
    const storageRef = ref(storage, `images/${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    imageUrls.push(downloadURL);
  }

  return imageUrls;
}


//#endregion


