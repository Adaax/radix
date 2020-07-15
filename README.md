![Radix Logo](/radix.png)

### At last! The forgotten console of the 1980s returns!

Radix was a home video game console released in 1982 by Dynamic Solutions (Dysol) Inc., based out of Actontown in Upstate New York. It was sold largely out of the Fast Electronics chain of stores, which were widespread in the area at that time (but closed down long ago).

Radix entered the market just as a glut of competing consoles were stuffing store shelves and confusing customers. The North American video game crash was looming, and Radix would disappear when the hammer fell, along with Dysol itself.

Radix was a budget entry into the console universe, meaning that they did not acquire licenses for any of the big arcade games of the time (a common practice among competitors). As such, all Radix games were developed in-house, so the console features a variety of unique titles that were never made for any other system.

![Radix Screenshot](/screen2.png)

Radix used the popular MOS 6502 processor as its CPU, meaning that anyone familiar with 6502 programming can get into Radix game development right away. Radix was powered by the **Radix Video Adapter (RaVA)** chip. Programming a Radix game largely involves interacting with the registers in memory that speak to this chip.

The RaVA sports the following features:

* 96 background tiles - enough for a full character set, plus background graphics
* 32 sprite tiles
* 3 screens - you choose which screen to display, and the other two remain cached
* 64 collision detection checks
* Sound synthesizer support for three types of sound waves (square, sine, noise)

**Radix Studio**, a modern IDE used for Radix game development, is included in this archive. RS includes an assembly language editor, and comes equipped with tools that will automatically generate code for sprites, sounds, and game maps.

![Radix Studio Screenshot](/screen4.png)

The **Radix Emulator** is also included, and is a fast, capable emulator that makes Radix games work on modern PCs just as they did on the original console.

Radix Studio is written in Javascript, using the [NW.js](https://nwjs.io/) framework, so it is a standalone application. Radix Emulator is written in Lua using the [LÖVE](https://love2d.org/) framework.

## Downloads

* **v0.1.0**:
	* Windows 64-bit: [zip](http://semioticblocks.com/downloads/radix_studio.zip)

### Instructions
For **zip** files, extract to any directory on your PC. Click **rs.bat** to launch Radix Studio.

The emulator can be launched from within Radix Studio.

## Quickstart
If you would like to get up and running with a sample game right away, follow these steps:

* Install Radix Studio and Emulator. Click on **rs.bat** to launch Radix Studio.

* Click the ![Open Button](lib/openbutton_back.png) **Open** button on the toolbar.

* Navigate to the **code** folder, and open **rogueai.asm**.

* Click the ![Open Button](lib/playbutton_back.png) **Play** button on the toolbar to launch the Emulator. The following window should open:

![Radix Emulator Screenshot](/screen7.png)

* The default for the **"1"** button is the **Z** key on the keyboard. Press this to start the game.

* To play **Rogue A.I.**, use the left/right arrow keys to move the player. Press **X** (i.e. the **"2"** button) to jump. Press the up/down keys to climb ladders. Press down to duck.

## Disclaimer
As you might have already guessed, Radix is a work of fiction. It falls into the category of what is now being called the "fantasy console" - that is, a game development platform that imposes artificial limitations on its capabilities to mimic the functionality of older console hardware. It was inspired by consoles and platforms such as the Atari 2600, Nintendo Entertainment System, and Commodore 64. It really does run off 6502 assembly language as it was implemented in these machines, albeit via a software interpreter instead of the "bare metal" hardware.

The Radix Emulator is really a Lua program that reads and interprets machine code stored in text files, moving data in and out of a virtual representation of memory based on the commands it receives. Graphics and sound are rendered based on values found in specific memory locations (or "registers", as they are often called), just as it was done on the old consoles. Feature-wise it allows for more sophisticated graphics than the Atari 2600, but not quite as good as the NES. The idea for hardware-based collision detection was derived from the Commodore 64, but it is implemented differently on the Radix.

Radix Studio can be used to develop games, demos, and other programs in 6502 assembly. Programming in assembly can be difficult at first, but once you get into a rhythm the code will come much faster. Pro tip: comment your code thoroughly. Even if you are the sort of programmer who (like me) doesn't tend to write comments. It will make it much easier to go back and edit and debug as needed.

Radix has two major inspirations. The first is the fantasy console scene, which came to the fore with the release of the Pico-8. The second is the homebrew programming scenes that have emerged around older consoles such as the Atari 2600. Radix seeks to bridge the gap between these movements by combining a retro software console with an assembly-based development language.

## Contact Info
* Matthew Wells
	* mattwells.j@gmail.com
	* [@10CLS](https://twitter.com/10CLS)
