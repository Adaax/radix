![Radix Logo](/radix.png)

### At last! The forgotten console of the 1980s returns!

Radix was a home video game console released in 1982 by Dynamic Solutions (Dysol) Inc., based out of Actontown in Upstate New York. It was sold largely out of the Fast Electronics chain of stores, which were widespread in the area at that time (but closed down long ago).

Radix entered the market just as a glut of competing consoles were stuffing store shelves and confusing customers. The North American video game crash was looming, and Radix would disappear when the hammer fell, along with Dysol itself.

Radix was a budget entry into the console universe, meaning that they did not acquire licenses for any of the big arcade games of the time (a common practice among competitors). As such, all Radix games were developed in-house, and as such it features unique titles that were never made for any other system.

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

* **v0.1.0:
	* Windows 64-bit: [zip](http://semioticblocks.com/downloads/radix_studio.zip)
