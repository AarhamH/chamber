<a id="readme-top"></a>
<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a>
    <img src="src/assets/chamber.png" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">chamber</h3>

  <p align="center">
    A small, performant, and ergonomic audio library for video editors
    <br />
    <br />
    <a>Demo coming soon...</a>
  </p>
</div>


_NOTE: THIS PROJECT IS INTENDED FOR PERSONAL AND NON-COMMERCIAL USE ONLY_
<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

Chamber is a fast and light-weight audio library to handle playback, audio storage, transcoding, trimming, and audio recording. This project aims to centralize many desired audio features into one client, allowing video editors to easily compile audios.

Chamber supports the following features:
* Basic audio playback features and playlist support
* Parallel downloads from YouTube; add audios to a download queue and download in batches!
* Transcoding; convert audios into mp3, ogg, opus, m4a, and m4b
* Waveform trimmer to clip and save sections from an audio
* (BETA) Audio recorder based on microphone input

Sample pics:

Playlist
![Chambe Screenshot 1][chamber-pic-1]

YouTube Search
![Chamber Screenshot 2][chamber-pic-2]

Audio Trimmer
![Chamber Screenshot 3][chamber-pic-3]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With
* [![Tauri][Tauri]][Tauri-url]
* [![SolidJs][SolidJs]][SolidJs-url]
* [![Rust][Rust]][Rust-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->
## Getting Started
To download chamber on to your machine, it is as easy as downloading the release bundle. However, if you wish to build from source or contribute to the project, refer to the following:

### Prerequisites
1. Install C/C++ build tools
2. Install Webkit (Linux and Windows only) 
2. Install Rust

Please address these instructions in [Tauri's official docs](https://v1.tauri.app/v1/guides/getting-started/prerequisites/)

### Installation
1. Clone the repo
   ```sh
   $ git clone https://github.com/AarhamH/chamber.git
   ```
2. Install NPM packages
   ```sh
   $ npm install
   ```
3. Run `npm setup`. This step is _necessary_ as it bundles ffmpeg and yt-dlp into the Tauri build
   ```sh
   $ npm run setup
   ```
4. Run the Tauri dev environment
   ```sh
   $ npm run chamber //this will not re-render app when Rust change is made
   ```
   ```sh
   $ npm run tauri dev // this will re-render app when Rust change is made
   ```
<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->
## Contributing
Contributions are welcome! If you have an idea for a feature, observed a bug, or want to make a positive change to the codebase, feel free to put up an issue.

<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->
## Contact
Project Link: [https://github.com/AarhamH/chamber](https://github.com/AarhamH/chamber)

Email: aarham.haider@gmail.com

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[Tauri]:https://img.shields.io/badge/Tauri-black?style=for-the-badge&logo=tauri&logoColor=white&link=https%3A%2F%2Fv1.tauri.app%2F
[Tauri-url]:https://v1.tauri.app/
[SolidJs]: https://img.shields.io/badge/SolidJS-black?style=for-the-badge&logo=solid&logoColor=white
[SolidJs-url]: https://www.solidjs.com/
[Rust]: https://img.shields.io/badge/Rust-black?style=for-the-badge&logo=rust&logoColor=white
[Rust-url]: https://www.rust-lang.org/
[chamber-pic-1]: https://github.com/user-attachments/assets/6454c8fa-5a4b-4736-b429-4c0cb9cfd6f2
[chamber-pic-2]: https://github.com/user-attachments/assets/9466b2d9-ff04-469a-824a-663cabb08485
[chamber-pic-3]: https://github.com/user-attachments/assets/fb732cf4-956f-4403-bd33-d2c3a47e00e2

