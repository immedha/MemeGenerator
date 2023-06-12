/*
 * Medha Gupta
 * May 4, 2023
 * CSE 154 AB: Allan Tran, Elizabeth Xiong
 *
 * This is the index.js page that adds interactivity to the meme generator in index.html. It allows
 * users to generate random meme images and add caption text to them.
 */
"use strict";
(function() {
  const API_IMG_URL = "https://api.imgflip.com/get_memes";
  const API_CAPTION_URL = "https://api.imgflip.com/caption_image";
  const MAX_CAPTION_NUM = 20;
  const MAX_CAPTION_LENGTH = 45;
  let chosenImage;

  window.addEventListener("load", init);

  /**
   * Adds functionality to generate image button.
   */
  function init() {
    let genImgBtn = qs("section > button");
    genImgBtn.addEventListener("click", generateImage);
  }

  /**
   * Gets inputted caption text and generates a meme with the caption text
   * using the chosen meme image. Does not generate caption text if all
   * textboxes do not have content.
   */
  async function generateCaptionImage() {
    let textboxes = qsa("input");
    let values = [];
    for (let i = 0; i < textboxes.length; i++) {
      if (textboxes[i].value !== "") {
        values.push(textboxes[i].value);
      }
    }
    if (values.length === textboxes.length) {
      await addCaptionImage(values);
    }
  }

  /**
   * Gets data required to create a meme image with the given caption text
   * @param {Array} values - array of captions for meme
   * @returns {Object} - object with data required to get meme image with caption
   */
  function createFormData(values) {
    let data = new FormData();
    data.append("username", "cse154");
    data.append("password", "imgflip123");
    data.append("template_id", chosenImage["id"]);
    for (let i = 0; i < Math.min(MAX_CAPTION_NUM, values.length); i++) {
      let keyString = "boxes[" + i + "][text]";
      data.append(keyString, values[i]);
    }
    return data;
  }

  /**
   * Displays the meme image with caption text on webpage
   * @param {Array} values - array of captions for meme
   */
  async function addCaptionImage(values) {
    qs("section > p").textContent = "";
    let data = createFormData(values);
    try {
      let response = await fetch(API_CAPTION_URL, {method: "POST", body: data});
      await statusCheck(response);
      let imgObject = await response.json();
      addImage(imgObject["data"]);
    } catch (err) {
      handleError();
    }
  }

  /**
   * Handles errors like if meme image is unable to be loaded
   */
  function handleError() {
    qs("section > p").textContent = "Image couldn't be generated! Please try again";
  }

  /**
   * Generates meme image without caption text and textboxes to provide caption text
   */
  async function generateImage() {
    qs("section > p").textContent = "";
    try {
      let response = await fetch(API_IMG_URL);
      await statusCheck(response);
      let allImages = await response.json();
      getRandomImage(allImages);
      addImage();
      generateTextArea();
    } catch (err) {
      handleError();
    }
  }

  /**
   * Displays textboxes for caption text on webpage
   */
  function createTextBoxes() {
    let numBoxes = chosenImage["box_count"];
    for (let i = 1; i <= numBoxes; i++) {
      let textbox = gen("input");
      textbox.type = "text";
      textbox.maxLength = MAX_CAPTION_LENGTH;
      let container = qs("section ~ section");
      container.appendChild(textbox);
    }
  }

  /**
   * Displays title and subtitle of text area on webpage
   */
  function createTextTitle() {
    let title = gen("h2");
    title.textContent = "add caption text";
    let subtitle = gen("h3");
    subtitle.textContent = "(make sure to add content to all the textboxes)";
    let container = qs("section ~ section");
    container.appendChild(title);
    container.appendChild(subtitle);
  }

  /**
   * Displays button to add the given text to the meme image
   */
  function createTextButton() {
    let addTextBtn = gen("button");
    addTextBtn.textContent = "Add text!";
    addTextBtn.addEventListener("click", generateCaptionImage);
    let container = qs("section ~ section");
    container.appendChild(addTextBtn);
  }

  /**
   * Generates the entire text area of webpage after meme image has been chosen
   */
  function generateTextArea() {
    let container = qs("section ~ section");
    container.innerHTML = "";
    createTextTitle();
    createTextBoxes();
    createTextButton();
  }

  /**
   * Gets a random image from the given set of all meme images
   * @param {Object} imgArray - all meme images
   */
  function getRandomImage(imgArray) {
    let max = imgArray["data"]["memes"].length;
    let arrIndex = Math.floor(Math.random() * max);
    chosenImage = imgArray["data"]["memes"][arrIndex];
  }

  /**
   * Displays the meme image on the webpage
   * @param {Object} imgObject - meme image with caption
   */
  function addImage(imgObject) {
    let imgContainer = qs("section");
    let prevImg = qs("img");
    if (prevImg !== null) {
      imgContainer.removeChild(prevImg);
    }
    let newImg = gen("img");
    if (arguments.length === 0) {
      newImg.src = chosenImage["url"];
    } else {
      newImg.src = imgObject["url"];
    }
    newImg.alt = chosenImage["name"];
    imgContainer.appendChild(newImg);
  }

  /**
   * Checks the status of an API response
   * @param {Object} res - response from API request
   * @returns {Object} response if in ok range, otherwise returns error
   */
  async function statusCheck(res) {
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res;
  }

  /**
   * Creates a new HTML element of a specific type
   * @param {String} type - HTML element type
   * @returns {Object} HTML element of that type
   */
  function gen(type) {
    return document.createElement(type);
  }

  /**
   * Gets an HTML element that can be described by the given selector
   * @param {String} selector - selector for an HTML element
   * @returns {Object} first HTML element identified by given selector
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * Creates an array of HTML elements that can be described by the given selector
   * @param {String} selector - selector for HTML element
   * @returns {Array} array of all HTML elements identified by given selector
   */
  function qsa(selector) {
    return document.querySelectorAll(selector);
  }
})();