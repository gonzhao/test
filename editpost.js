import { db } from "./firebase.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

//#region Initialize Quill editor
const quill = new Quill('#editor-container', {
  theme: 'snow'
});

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

      displayPost(postData.content);
      displayTitle(postData.title);
      displayCollections(postData.collections);

    } else {
      alert("No such post!");
    }
  } catch (error) {
    console.error("Error fetching post:", error);
    alert("Error fetching post: " + error.message);
  }

  // SAVE
  const saveButton = document.getElementById('save-button');
  saveButton.addEventListener('click', async () => {
    const updatedContent = quill.root.innerHTML; // Get the HTML content from Quill
    const updatedTitle = document.getElementById('post-title').value;
    const updatedCollections = getSelectedCollections(); // Get updated collections

    try {
      await savePost(postId, updatedTitle , updatedContent, updatedCollections);
      alert("Post updated successfully!");
      window.location.href = `post.html?id=${postId}`;
      
    } catch (error) {
      alert("Error saving post: " + error.message);
    }
  });
});

function displayPost(content) {
  // Display the post content in the Quill editor
  quill.clipboard.dangerouslyPasteHTML(content);
}

function displayTitle(title) {
  document.getElementById('post-title').value = title;
}

function displayCollections(currentCollections) {
  const collectionsDropdown = document.getElementById('collections-dropdown');
  if (!collectionsDropdown) return;

  // Clear previous selections
  collectionsDropdown.querySelectorAll('.collection-item.selected')
    .forEach(item => item.classList.remove('selected'));

  // Check if currentCollections is an array and iterate over it
  if (Array.isArray(currentCollections)) {
    currentCollections.forEach(collection => {
      const collectionItem = collectionsDropdown.querySelector(`[data-value="${collection}"]`);
      if (collectionItem) {
        collectionItem.classList.add('selected');
      }
    });
  }
}

function getSelectedCollections() {
  // Get the selected collections from the dropdown
  const collectionsDropdown = document.getElementById('collections-dropdown');
  if (!collectionsDropdown) return [];

  return Array.from(collectionsDropdown.querySelectorAll('.collection-item.selected'))
    .map(item => item.getAttribute('data-value'));
}

async function savePost(id, title, content, collections) {
  // Save the updated post content and collections to Firestore
  try {
    const postRef = doc(db, "Posts", id);
    await setDoc(postRef, {title, content, collections }, { merge: true });
    
  } catch (error) {
    console.error("Error saving post:", error);
    alert("Error saving post: " + error.message);
  }
}

// Add event listeners to the collection items to toggle selection
document.addEventListener('click', (event) => {
  if (event.target.classList.contains('collection-item')) {
    event.target.classList.toggle('selected');
  }
});

//#endregion



