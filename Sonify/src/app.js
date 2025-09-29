/*global codapInterface:true*/
import packageInfo from "../package.json";
import Vue from "vue";
import Nexus from "nexusui";
import { default as CodapPluginHelper } from "./CodapPluginHelper.js";
import * as localeManager from "./localeManager.js";

const helper = new CodapPluginHelper(codapInterface);
/**
 * Replicates the csound scale function.
 * Scales a number between zero and one to the given range.
 * Note the inversion of max and min in the argument list.
 **/
function scale(v, max, min) {
  return v * (max - min) + min;
}

/**
 * Replicates csound expcurve function.
 * @param x
 * @param y
 * @returns {number}
 */
function expcurve(x, y) {
  return (Math.exp(x * Math.log(y)) - 1) / (y - 1);
}

function flattenGroupedArrays(data) {
  if (Array.isArray(data)) {
    return data;
  } else if (data) {
    return Object.values(data).flatMap(flattenGroupedArrays);
  }
}

function hashMapById(array) {
  return array.reduce((result, item) => {
    result[item.id] = item;
    return result;
  }, {});
}

const PLAY_TOGGLE_IDLE = false;
const PLAY_TOGGLE_PLAYING = true;

const kAttributeMappedProperties = [
  "time",
  "pitch", //,
  // 'duration',
  // 'loudness',
  // 'stereo'
];

const trackingGlobalName = "sonificationTracker";
const minDur = 0.02;
const maxDur = 0.5;
const defaultNoteDuration = 0.2;
// const durRange = maxDur - minDur;

const minPitchMIDI = 48;
const maxPitchMIDI = 96;
// const pitchMIDIRange = maxPitchMIDI - minPitchMIDI;

const FOCUS_MODE = "Focus";
const CONTRAST_MODE = "Contrast";
const CONNECT_MODE = "Connect";

const UNSELECT_VALUE = "NULL";

const app = new Vue({
  el: "#app",
  data: {
    name: "Sonify",
    version: packageInfo.version,
    dim: {
      width: 325,
      height: 360,
    },
    loading: true,
    // state managed by CODAP
    state: {
      focusedContext: "",
      focusedCollection: "",
      pitchAttribute: "",
      pitchAttrIsDate: false,
      pitchAttrIsDescending: false,
      timeAttribute: "",
      timeAttrIsDate: false,
      timeAttrIsDescending: false,
      durationAttribute: "",
      durationAttrIsDate: false,
      durationAttrIsDescending: false,
      loudnessAttribute: "",
      loudnessAttrIsDate: false,
      loudnessAttrIsDescending: false,
      stereoAttribute: "",
      stereoAttrIsDate: false,
      stereoAttrIsDescending: false,
      connectByCollIds: null,
      playbackSpeed: 0.5,
      loop: false,
      smoothSound: false,
      selectionMode: FOCUS_MODE,
    },
    data: null,
    contexts: null, // array of context names
    collections: null,
    attributes: null,

    connectByAvailable: true,

    globals: [],

    pitchAttrRange: null,
    pitchArray: [],

    timeAttrRange: null,
    timeArray: [],

    durationAttrRange: null,
    durationArray: [],

    loudnessAttrRange: null,
    loudnessArray: [],

    stereoAttrRange: null,
    stereoArray: [],

    selectedTimeRange: null,
    isSelectionScoped: false,

    csdFiles: ["Sonify.csd"],
    selectedCsd: null,
    csoundReady: false,

    synchronized: false,

    // Remove all playToggle-related logic and references
    playing: false,

    speedSlider: null,
    loopToggle: null,
    smoothSoundToggle: null,
    userMessage: null,
    timerId: null,
    phase: 0,
    cycleEndTimerId: null,
    selectionModes: [FOCUS_MODE, CONNECT_MODE],
    l: localeManager,
    trackerInitialized: false,
  },
  watch: {
    state: {
      handler(newState /*, oldState*/) {
        helper.updateState(newState);
      },
      deep: true,
    },
  },
  methods: {
    setupUI() {
      this.setUserMessage("DG.plugin.sonify.noDatasetMessage");
      // Add play/pause button using NexusUI
      this.playPauseButton = new Nexus.Button("#play-pause-button", {
        size: [25, 25],
        mode: "toggle",
        state: false
      });
      // Override render to add SVG play/pause icon
      const playPath = "M8 5v14l11-7z"; // Play triangle
      const pausePath = "M6 4h4v16H6V4zm8 0h4v16h-4V4z"; // Pause bars
      const button = this.playPauseButton;
      // Add icon element if not present
      if (!button.iconElement) {
        button.iconElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
        button.element.appendChild(button.iconElement);
        // Ensure clicking the icon triggers the button
        button.iconElement.style.pointerEvents = 'auto';
        button.iconElement.addEventListener('click', (e) => {
          e.stopPropagation();
          button.interactionTarget.dispatchEvent(new MouseEvent('mousedown', {bubbles: true, cancelable: true}));
          button.interactionTarget.dispatchEvent(new MouseEvent('mouseup', {bubbles: true, cancelable: true}));
        });
      }
      button.render = function() {
        // Call original render
        Nexus.Button.prototype.render.call(this);
        // Set icon path and color
        if (this.state) {
          this.iconElement.setAttribute("d", pausePath);
        } else {
          this.iconElement.setAttribute("d", playPath);
        }
        this.iconElement.setAttribute("fill", this.state ? this.colors.fill : this.colors.dark);
        // Center the icon perfectly in the pad
        const iconSize = 16; // SVG path is designed for 24x24, but we want 16x16 for better centering
        const centerX = this.width / 2 - iconSize / 2;
        const centerY = this.height / 2 - iconSize / 2;
        this.iconElement.setAttribute("transform", `translate(${centerX}, ${centerY}) scale(${iconSize/24})`);
        // Set pad outline to NexusUI accent color
        this.pad.setAttribute("stroke", this.colors.accent);
      };
      // Initial render
      this.playPauseButton.render();
      // Add play/pause logic
      this.playPauseButton.on("change", (isPlaying) => {
        if (isPlaying) {
          this.setUserMessage("DG.plugin.sonify.playingMessage");
          this.play();
        } else {
          this.setUserMessage("DG.plugin.sonify.stoppingMessage");
          // Only reset play if we're actually playing (user clicked pause)
          // Don't reset if playback ended naturally (playing is already false)
          if (this.playing) {
            this.resetPlay(false);
          }
        }
      });
      // Ensure button state reflects playback status if stopped elsewhere
      this.$watch('playing', (newVal) => {
        if (this.playPauseButton.state !== newVal) {
          this.playPauseButton.state = newVal;
        }
      });

      // Add reset button using NexusUI, matching play button size and style
      this.resetButton = new Nexus.Button("#reset-button", {
        size: [25, 25],
        mode: "button",
        state: false
      });
      // Use the provided SVG path for the reset icon
      const resetPath = "M106.2,22.2c1.78,2.21,3.43,4.55,5.06,7.46c5.99,10.64,8.52,22.73,7.49,34.54c-1.01,11.54-5.43,22.83-13.37,32.27 c-2.85,3.39-5.91,6.38-9.13,8.97c-11.11,8.93-24.28,13.34-37.41,13.22c-13.13-0.13-26.21-4.78-37.14-13.98 c-3.19-2.68-6.18-5.73-8.91-9.13C6.38,87.59,2.26,78.26,0.71,68.41c-1.53-9.67-0.59-19.83,3.07-29.66 c3.49-9.35,8.82-17.68,15.78-24.21C26.18,8.33,34.29,3.76,43.68,1.48c2.94-0.71,5.94-1.18,8.99-1.37c3.06-0.2,6.19-0.13,9.4,0.22 c2.01,0.22,3.46,2.03,3.24,4.04c-0.22,2.01-2.03,3.46-4.04,3.24c-2.78-0.31-5.49-0.37-8.14-0.2c-2.65,0.17-5.23,0.57-7.73,1.17 c-8.11,1.96-15.1,5.91-20.84,11.29C18.43,25.63,13.72,33,10.62,41.3c-3.21,8.61-4.04,17.51-2.7,25.96 c1.36,8.59,4.96,16.74,10.55,23.7c2.47,3.07,5.12,5.78,7.91,8.13c9.59,8.07,21.03,12.15,32.5,12.26c11.47,0.11,23-3.76,32.76-11.61 c2.9-2.33,5.62-4.98,8.13-7.97c6.92-8.22,10.77-18.09,11.66-28.2c0.91-10.37-1.32-20.99-6.57-30.33c-1.59-2.82-3.21-5.07-5.01-7.24 l-0.53,14.7c-0.07,2.02-1.76,3.6-3.78,3.52c-2.02-0.07-3.6-1.76-3.52-3.78l0.85-23.42c0.07-2.02,1.76-3.6,3.78-3.52 c0.13,0,0.25,0.02,0.37,0.03l0,0l22.7,3.19c2,0.28,3.4,2.12,3.12,4.13c-0.28,2-2.12,3.4-4.13,3.12L106.2,22.2L106.2,22.2z";
      const resetButton = this.resetButton;
      if (!resetButton.iconElement) {
        resetButton.iconElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
        resetButton.element.appendChild(resetButton.iconElement);
        // Tooltip for accessibility
        resetButton.element.setAttribute("title", this.l.tr("DG.plugin.sonify.resetTooltip"));
        // Ensure clicking the icon triggers the button
        resetButton.iconElement.style.pointerEvents = 'auto';
        resetButton.iconElement.addEventListener('click', (e) => {
          e.stopPropagation();
          resetButton.interactionTarget.dispatchEvent(new MouseEvent('mousedown', {bubbles: true, cancelable: true}));
          resetButton.interactionTarget.dispatchEvent(new MouseEvent('mouseup', {bubbles: true, cancelable: true}));
        });
      }
      resetButton.render = function() {
        Nexus.Button.prototype.render.call(this);
        this.iconElement.setAttribute("d", resetPath);
        this.iconElement.setAttribute("fill", "#000");
        this.iconElement.setAttribute("stroke", "#000");
        this.iconElement.setAttribute("stroke-width", "3");
        // Center and scale the icon to fit 16x16 area (original viewBox is 122.88x118.66)
        const iconSize = 16;
        const scaleX = iconSize / 122.88;
        const scaleY = iconSize / 118.66;
        const centerX = this.width / 2 - iconSize / 2;
        const centerY = this.height / 2 - iconSize / 2;
        this.iconElement.setAttribute("transform", `translate(${centerX}, ${centerY}) scale(${scaleX},${scaleY})`);
        // Set pad outline to NexusUI accent color
        this.pad.setAttribute("stroke", this.colors.accent);
      };
      this.resetButton.render();
      // Add click event handler for reset button
      this.resetButton.on("change", () => {
        this.resetPlay(true);
      });

      // this.playToggle = new Nexus.Toggle("#play-toggle", {
      //   size: [40, 20],
      //   state: false,
      // });

      // this.playToggle.on("change", (v) => {
      //   if (v) {
      //     this.setUserMessage("DG.plugin.sonify.playingMessage");
      //     this.play();
      //   } else {
      //     this.setUserMessage("DG.plugin.sonify.stoppingMessage");
      //     this.resetPlay();
      //   }
      // });

      this.loopToggle = new Nexus.Toggle("#loop-toggle", {
        size: [40, 20],
        state: this.state.loop,
      });

      this.loopToggle.on("change", (v) => {
        this.state.loop = v;

        this.cycleEndTimerId && clearTimeout(this.cycleEndTimerId);

        if (this.playing) {
          const phase = csound.RequestChannel("phase");
          const loopTiming = this.calculateLoopTiming(phase);
          const remainingPlaybackTime = loopTiming.remainingTime * 1000;

          if (this.state.loop) {
            this.cycleEndTimerId = setTimeout(
              () => {
                this.restartCSoundMaster(loopTiming.restartPhase);
                this.triggerNotes(loopTiming.restartPhase);
              },
              remainingPlaybackTime,
            );
          } else {
            this.cycleEndTimerId = setTimeout(() => {
              this.resetPlay(true);
            }, remainingPlaybackTime);
          }
        }
      });

      this.smoothSoundToggle = new Nexus.Toggle("#smooth-sound-toggle", {
        size: [40, 20],
        state: false,
      });

      this.smoothSoundToggle.on("change", (v) => {
        this.state.smoothSound = v;
        // Toggle controls selectionMode: OFF = FOCUS_MODE, ON = CONNECT_MODE
        this.state.selectionMode = v ? CONNECT_MODE : FOCUS_MODE;
        // Re-select cases when selection mode changes
        this.onSelectionModeSelectedByUI();
                // Continue playback with new mode instead of resetting
        if (this.playing) {
          this.resetPlay(false); // Preserve current position
          // Use Vue's $nextTick to simulate button press
          this.$nextTick(() => {
            this.playPauseButton.state = true; // This should trigger the button's event handler
          });
        }
      });

      this.speedSlider = new Nexus.Slider("#speed-slider", {
        size: [200, 20],
        mode: "absolute",
        value: this.state.playbackSpeed,
      });

      this.speedSlider.on("release", (/*v*/) => {
        this.state.playbackSpeed = this.speedSlider._value.value;

        if (this.csoundReady) {
          csound.SetChannel("playbackSpeed", this.state.playbackSpeed);

          if (this.playing) {
            this.resetPlay(false);
            // Use Vue's $nextTick to simulate button press
            this.$nextTick(() => {
              this.playPauseButton.state = true; // This should trigger the button's event handler
            });
          }
        }
      });
      // Undo: Make the entire button area clickable
      // (Restore default: only the pad is clickable)
      // this.playPauseButton.interactionTarget = this.playPauseButton.element;
    },
    setUserMessage(msgKey, ...args) {
      this.userMessage = localeManager.tr(msgKey, args);
    },
    logMessage(msg) {
      this.setUserMessage("log: %1", msg);
      console.log(`MicroRhythm: ${msg}`);
    },
    setupDrag() {
      function findElementsUnder(pos) {
        if (pos) {
          return document
            .elementsFromPoint(pos.x, pos.y)
            .filter((el) => el.classList.contains("drop-area"));
        }
      }
      helper.on("dragDrop[attribute]", "dragenter", (data) => {
        let els = findElementsUnder(data.values.position);
        if (els) {
          els.forEach((el) => {
            el.style.backgroundColor = "rgba(255,255,0,0.5)";
          });
        }
      });

      helper.on("dragDrop[attribute]", "dragleave", (data) => {
        let els = findElementsUnder(data.values.position);
        if (els) {
          els.forEach((el) => {
            el.style.backgroundColor = "transparent";
          });
        }
      });

      helper.on("dragDrop[attribute]", "drag", (data) => {
        document.querySelectorAll(".drop-area").forEach((el) => {
          el.style.backgroundColor = "transparent";
        });
        let els = findElementsUnder(data.values.position);
        els.forEach((el) => {
          el.style.backgroundColor = "rgba(255,255,0,0.5)";
        });
      });

      helper.on("dragDrop[attribute]", "drop", (data) => {
        let els = findElementsUnder(data.values.position);
        if (
          this.contexts &&
          this.contexts.includes(data.values.context.name) &&
          this.state.focusedContext !== data.values.context.name
        ) {
          this.state.focusedContext = data.values.context.name;
          this.onContextFocused();
        }

        els.forEach((el) => {
          if (
            this.attributes &&
            this.attributes.includes(data.values.attribute.name)
          ) {
            if (el.id.startsWith("pitch")) {
              this.state.pitchAttribute = data.values.attribute.name;
              this.onPitchAttributeSelectedByUI();
            } else if (el.id.startsWith("time")) {
              this.state.timeAttribute = data.values.attribute.name;
              this.onTimeAttributeSelectedByUI();
            }
          }
        });
      });

      helper.on("dragDrop[attribute]", "dragstart", (/*data*/) => {
        document.querySelectorAll(".drop-area").forEach((el) => {
          el.style.outline = "3px solid #ffff00";
        });
      });

      helper.on("dragDrop[attribute]", "dragend", (/*data*/) => {
        document.querySelectorAll(".drop-area").forEach((el) => {
          el.style.outline = "3px solid transparent";
          el.style.backgroundColor = "transparent";
        });
      });
    },
    /**
     * Updates the CODAP Global Value with the current time offset within
     * the current score.
     */
    updateTracker() {
      if (!this.trackerInitialized) return;
      if (this.timeAttrRange) {
        let cyclePos = 0;
        try {
          cyclePos = csound.RequestChannel("phase") || 0;
        } catch (ex) {
          console.warn("CSound phase undefined. Assuming 0.");
        }
        
        // For obscure reasons CODAP Time is measured in seconds,
        // not milliseconds. Normally this adjustment is automatic.
        // In order for the sonification tracker to align with the
        // data we need to take this obscurity into account
        const timeAdj = this.state.timeAttrIsDate ? 1000 : 1;

        // Except in the CONNECT mode, the note events (time offsets)
        // are slightly compressed to end the last note event at time=1.
        const modeAdj =
          this.state.selectionMode === CONNECT_MODE
            ? 1
            : (this.timeAttrRange.len - 1) / this.timeAttrRange.len;

        let dataTime;
        
        // Handle selection-scoped playback: map CSound phase to selection range
        if (this.isSelectionScoped && this.selectedTimeRange) {
          // In selection-scoped mode, the CSound phase starts at the selection start phase
          // and represents the current position in the overall dataset timeline
          // So we can use it directly to calculate the data time
          dataTime = scale(
            cyclePos / modeAdj,
            this.timeAttrRange.max / timeAdj,
            this.timeAttrRange.min / timeAdj,
          );
          
          // Debug: Log tracker calculation for selection-scoped mode
          console.log("Selection-scoped tracker:", {
            cyclePos,
            dataTime,
            timeAdj,
            modeAdj
          });
        } else {
          // Normal behavior: map CSound phase to entire dataset range
          dataTime = scale(
            cyclePos / modeAdj,
            this.timeAttrRange.max / timeAdj,
            this.timeAttrRange.min / timeAdj,
          );
        }
        
        helper.setGlobal(trackingGlobalName, dataTime);
      }
    },
    resetPitchTimeMaps() {
      this.state.pitchAttribute = this.state.timeAttribute = null;
      this.state.pitchAttrRange = this.timeAttrRange = null;
    },
    onContextFocused() {
      this.collections = helper.getCollectionsForContext(
        this.state.focusedContext,
      );
      this.attributes = helper.getAttributeNamesForContext(
        this.state.focusedContext,
      );

      this.resetPitchTimeMaps();
    },
    getAttributeType(context, attrName) {
      let attributes = helper.getAttributeDefsForContext(context);
      let attr =
        attributes && attributes.find((attr) => attrName === attr.name);
      if (attr) return attr.type;
    },
    setIfDateTimeAttribute(type) {
      let contextName = this.state.focusedContext;
      let attrName = this.state[`${type}Attribute`];
      let attrType = this.getAttributeType(contextName, attrName);
      let values = helper.getAttrValuesForContext(contextName, attrName) || [];
      // an attribute is a Date attribute if attribute type is 'date' or
      // all of its values are Date objects or date strings
      let isDateAttribute =
        attrType === "date" ||
        (values.length > 0 &&
          !values.some((x) => {
            let isDate =
              x instanceof Date ||
              (typeof x === "string" &&
                !isNaN(new Date(x).valueOf()) &&
                isNaN(x));
            return !isDate;
          }));
      this.state[`${type}AttrIsDate`] = isDateAttribute;
    },
    /**
     * @param type {string} pitch, time, loudness, or stereo
     **/
    processMappedAttribute(type) {
      if (this.checkIfGlobal(this.state[`${type}Attribute`])) {
        this[`${type}AttrRange`] = {
          len: 1,
          min: 0,
          max: 1,
        };
      } else {
        this.setIfDateTimeAttribute(type);
        this[`${type}AttrRange`] = this.calcRange(
          this.state[`${type}Attribute`],
          this.state[`${type}AttrIsDate`],
          this.state[`${type}AttrIsDescending`],
        );
        this.updateTracker();
      }

      this.reselectCases();
    },
    onBackgroundSelect() {
      helper.selectSelf();
    },
    onSelectionModeSelectedByUI() {
      this.reselectCases();
    },
    onPitchAttributeSelectedByUI() {
      this.setUserMessage(
        this.state.pitchAttribute
          ? "DG.plugin.sonify.selectPitchMessage"
          : "DG.plugin.sonify.deselectPitchMessage",
      );
      this.processMappedAttribute("pitch");

      if (this.playing) {
        this.phase = csound.RequestChannel("phase");
        this.stopNotes();
        this.play();
      }
    },
    onTimeAttributeSelectedByUI() {
      this.setUserMessage(
        this.state.timeAttribute
          ? "DG.plugin.sonify.selectTimeMessage"
          : "DG.plugin.sonify.deselectTimeMessage",
      );
      this.processMappedAttribute("time");

      if (this.playing) {
        this.phase = csound.RequestChannel("phase");
        this.stopNotes();
        this.play();
      }
    },

    checkIfGlobal(attr) {
      return this.globals.some((g) => g.name === attr);
    },

    reselectCases() {
      this.getSelectedItems(this.state.focusedContext).then(
        this.onItemsSelected,
      );
    },

    onGetData() {
      this.contexts = helper.getContexts();
      if (this.contexts && this.contexts.length === 1) {
        this.state.focusedContext =
          this.state.focusedContext || this.contexts[0];
      }

      if (this.state.focusedContext) {
        let attrs = helper.getAttributeNamesForContext(
          this.state.focusedContext,
        );

        this.attributes = attrs;
        this.reselectCases();
        kAttributeMappedProperties.forEach((p) => {
          if (this[p + "AttrRange"]) {
            this.processMappedAttribute(p);
          }
        });

        // Re-populate the collections dropdown.
        const collections = helper.getCollectionsForContext(
          this.state.focusedContext,
        );

        // Filter out the collections with the size of items (the leaf nodes).
        const itemsLength = helper.items[this.state.focusedContext].length;
        this.collections = collections.filter(
          (collection) =>
            helper.data[this.state.focusedContext][collection]?.length !==
            itemsLength,
        );

        // Do not show the "connect by" dropdown UI if there are not hierarchies / collections.
        this.connectByAvailable = !!this.collections?.length;
        
        // Auto-select second to last collection when connectByAvailable is true
        if (this.connectByAvailable) {
          // Set the focused collection to the second to last collection (parent above leaf)
          const collectionIndex = Math.max(0, this.collections.length - 2);
          this.state.focusedCollection = this.collections[collectionIndex];
          // Populate connectByCollIds with the selected collection's case IDs
          const context = helper.data[this.state.focusedContext];
          const collection = context?.[this.state.focusedCollection];
          this.state.connectByCollIds = collection?.map((c) => c.id);
        } else {
          // Clear selection when no collections are available
          this.state.focusedCollection = "";
          this.state.connectByCollIds = null;
        }
      }
    },
    onGetGlobals() {
      this.globals = helper.globals;

      if (this.playing) {
        this.reselectCases();
      }
    },
    calcRange(attribute, isDateTime, inverted) {
      // let attrValues = helper.getAttributeValues(this.state.focusedContext, this.focusedCollection, attribute);
      let attrValues = attribute
        ? helper.getAttrValuesForContext(this.state.focusedContext, attribute)
        : [];

      if (attrValues) {
        if (isDateTime) {
          attrValues = attrValues
            .map(Date.parse)
            .filter((v) => !Number.isNaN(v));
        } else {
          attrValues = attrValues
            .map(parseFloat)
            .filter((v) => !Number.isNaN(v));
        }

        if (attrValues.length !== 0) {
          return {
            len: attrValues.length,
            min: inverted ? Math.max(...attrValues) : Math.min(...attrValues),
            max: inverted ? Math.min(...attrValues) : Math.max(...attrValues),
          };
        } else {
          return { len: 0, min: 0, max: 0 };
        }
      } else {
        return { len: 0, min: 0, max: 0 };
      }
    },

    prepMapping(args) {
      let param = args["param"];
      let items = args["items"];

      if (this[`${param}AttrRange`]) {
        let range =
          this[`${param}AttrRange`].max - this[`${param}AttrRange`].min;

        if (range === 0) {
          this[`${param}Array`] = items.map((c) => ({ id: c.id, val: 0.5 }));
        } else {
          if (this.checkIfGlobal(this.state[`${param}Attribute`])) {
            let global = this.globals.find(
              (g) => g.name === this.state[`${param}Attribute`],
            );
            let value =
              global.value > 1 ? 1 : global.value < 0 ? 0 : global.value;

            this[`${param}Array`] = items.map((c) => ({
              id: c.id,
              val: value,
            }));
          } else {
            this[`${param}Array`] = items.map((c) => {
              let value = this.state[`${param}AttrIsDate`]
                ? Date.parse(c.values[this.state[`${param}Attribute`]])
                : c.values[this.state[`${param}Attribute`]];
              value = isNaN(parseFloat(value))
                ? NaN
                : (value - this[`${param}AttrRange`].min) / range;
              return { id: c.id, val: value };
            });
          }
        }
      }
    },

    onItemsSelected(items) {
      const { selectionMode, timeAttrIsDate, timeAttribute } = this.state;

      // TODO: Does this only include all the leaf nodes or also the grouping nodes? Double check.
      const allItems = helper.getItemsForContext(this.state.focusedContext);

      let connectedCasesById;
      let selectedItemIdsSet;

      if (selectionMode === CONNECT_MODE) {
        const context = helper.data[this.state.focusedContext];
        const flattenedGroupedCases = flattenGroupedArrays(context);
        connectedCasesById = hashMapById(flattenedGroupedCases);
        selectedItemIdsSet = new Set(items.map((item) => item.id));

        if (timeAttrIsDate) {
          allItems.sort(
            (a, b) =>
              Date.parse(a.values[timeAttribute]) -
              Date.parse(b.values[timeAttribute]),
          );
        } else {
          allItems.sort(
            (a, b) => a.values[timeAttribute] - b.values[timeAttribute],
          );
        }
      }

      if (this.timeAttrRange) {
        let range = this.timeAttrRange.max - this.timeAttrRange.min;

        if (range === 0) {
          if (selectionMode === CONTRAST_MODE) {
            const idItemMap = allItems.reduce(
              (acc, curr) => (
                (acc[curr.id] = { id: curr.id, val: 0, sel: false }), acc
              ),
              {},
            );
            items.forEach((c) => (idItemMap[c.id].sel = true));
            this.timeArray = Object.values(idItemMap);
          } else {
            // FOCUS_MODE: Include selection information for consistency
            const selectedItemIdsSet = new Set(items.map((item) => item.id));
            this.timeArray = items.map((c) => ({ 
              id: c.id, 
              val: 0, 
              selected: selectedItemIdsSet.has(c.id) 
            }));
          }
        } else {
          if (this.checkIfGlobal(timeAttribute)) {
            let global = this.globals.find((g) => g.name === timeAttribute);
            let value =
              global.value > 1 ? 1 : global.value < 0 ? 0 : global.value;

            if (selectionMode === CONTRAST_MODE) {
              const idItemMap = allItems.reduce(
                (acc, curr) => (
                  (acc[curr.id] = { id: curr.id, val: value, sel: false }), acc
                ),
                {},
              );
              items.forEach((c) => (idItemMap[c.id].sel = true));
              this.timeArray = Object.values(idItemMap);
            } else {
              // FOCUS_MODE: Include selection information for consistency
              const selectedItemIdsSet = new Set(items.map((item) => item.id));
              this.timeArray = items.map((c) => ({ 
                id: c.id, 
                val: value, 
                selected: selectedItemIdsSet.has(c.id) 
              }));
            }
          } else {
            if (selectionMode === CONTRAST_MODE) {
              const idItemMap = allItems.reduce((acc, curr) => {
                const value = this.state.timeAttrIsDate
                  ? Date.parse(curr.values[timeAttribute])
                  : curr.values[timeAttribute];
                // The last event's time offset should be `(1 - event duration)`.
                const valueScaled = isNaN(parseFloat(value))
                  ? NaN
                  : ((value - this.timeAttrRange.min) / range) *
                    ((this.timeAttrRange.len - 1) / this.timeAttrRange.len);
                acc[curr.id] = { id: curr.id, val: valueScaled, sel: false };
                return acc;
              }, {});

              items.forEach((c) => (idItemMap[c.id].sel = true));
              this.timeArray = Object.values(idItemMap);
            } else if (selectionMode === CONNECT_MODE) {
              this.timeArray = allItems.map((c) => {
                let value = timeAttrIsDate
                  ? Date.parse(c.values[timeAttribute])
                  : c.values[timeAttribute];
                // The last event's time offset should be 1.
                value = isNaN(parseFloat(value))
                  ? NaN
                  : (value - this.timeAttrRange.min) / range;
                const parent = connectedCasesById?.[c.id]?.parent;
                const selected = selectedItemIdsSet.has(c.id);
                return { id: c.id, val: value, parent, selected };
              });
            } else {
              // FOCUS_MODE: Include selection information for consistency
              const selectedItemIdsSet = new Set(items.map((item) => item.id));
              this.timeArray = items.map((c) => {
                let value = timeAttrIsDate
                  ? Date.parse(c.values[timeAttribute])
                  : c.values[timeAttribute];
                value = isNaN(parseFloat(value))
                  ? NaN
                  : ((value - this.timeAttrRange.min) / range) *
                    ((this.timeAttrRange.len - 1) / this.timeAttrRange.len);
                const selected = selectedItemIdsSet.has(c.id);
                return { id: c.id, val: value, selected };
              });
            }
          }
        }
      }

      // ['pitch', 'duration', 'loudness', 'stereo'].forEach(param => this.prepMapping({ param: param, items: CONTRAST_MODE ? allItems : items }));
      this.prepMapping({
        param: "pitch",
        items: [CONTRAST_MODE, CONNECT_MODE].includes(selectionMode)
          ? allItems
          : items,
      });

      // Calculate and store selection bounds after timeArray is populated
      this.selectedTimeRange = this.getSelectedTimeRange();
      
      // Update selection scoped flag based on whether we have selected cases
      this.isSelectionScoped = this.hasSelectedCases() && this.selectedTimeRange !== null;

      if (this.playing) {
        this.resetPlay(true); // Full reset when selection changes
      }
    },
    stopNotes() {
      csound.Event("e");
    },
    /**
     * Sets sound play and related state to its initial condition:
     *   * sound is stopped
     *   * the UI Play toggle is stopped
     *   * the phase and tracking global are at their minimum value
     */
    resetPlay(isTrueReset = false) {
      console.log("=== RESETPLAY CALLED ===");
      console.log("isTrueReset:", isTrueReset);
      console.log("Phase before reset:", this.phase);
      console.log("Selection scoped:", this.isSelectionScoped);
      
      // For pause/resume, read the phase BEFORE stopping CSound
      let resumePhase = 0;
      if (!isTrueReset && this.playing) {
        try {
          resumePhase = csound.RequestChannel("phase") || 0;
          console.log("Resume mode - phase read BEFORE stop:", resumePhase);
          
          // Validate the phase is reasonable (between 0 and 1)
          if (resumePhase < 0 || resumePhase > 1) {
            console.warn("Invalid phase from CSound, resetting to 0:", resumePhase);
            resumePhase = 0;
          }
        } catch (ex) {
          resumePhase = 0;
          console.log("Resume mode - exception reading phase, using 0");
        }
      }
      
      this.stop();
      if (isTrueReset) {
        // For selection-scoped playback, reset to selection start instead of 0
        if (this.isSelectionScoped && this.selectedTimeRange) {
          const selectionPhaseRange = this.calculateSelectionPhaseRange();
          if (selectionPhaseRange && selectionPhaseRange.isValid) {
            this.phase = selectionPhaseRange.startPhase;
            console.log("True reset - selection-scoped phase set to:", this.phase);
          } else {
            this.phase = 0;
            console.log("True reset - fallback to phase 0");
          }
        } else {
          this.phase = 0;
          console.log("True reset - phase set to 0");
        }
        
        // Update tracker to reflect the reset position
        let timeAdj = this.state.timeAttrIsDate ? 1000 : 1;
        let trackerValue;
        
        if (this.isSelectionScoped && this.selectedTimeRange) {
          // Set tracker to selection start time
          trackerValue = this.selectedTimeRange.min / timeAdj;
        } else {
          // Set tracker to dataset start time
          trackerValue = this.timeAttrRange
            ? this.timeAttrRange.min / timeAdj
            : 0;
        }
        
        helper.setGlobal(trackingGlobalName, trackerValue);
        console.log("Tracker set to:", trackerValue);
      } else {
        // Store current phase for resume (already read before stopping CSound)
        this.phase = resumePhase;
        console.log("Resume mode - using phase read before stop:", resumePhase);
      }
      console.log("Phase after reset:", this.phase);
    },
    
    restartCSoundMaster(phase) {
      // Only restart if we're currently playing (not paused)
      if (!this.playing) {
        console.log("Skipping CSound MASTER restart - not playing");
        return;
      }
      
      // Stop current MASTER
      csound.Event("i-1 0 0");
      
      // Start new MASTER with specified phase
      csound.Event(`i1 0 -1 ${phase}`);
      
      console.log("Restarted CSound MASTER with phase:", phase);
    },
    
    triggerNotes(phase) {
      const { playbackSpeed, loop, selectionMode } = this.state;
      const pitchTimeArrayLengthsMatch =
        this.pitchArray.length === this.timeArray.length;

      let gkfreq = expcurve(playbackSpeed, 50);
      gkfreq = expcurve(gkfreq, 50);
      gkfreq = scale(gkfreq, 5, 0.05);

      // Handle selection-scoped playback timing
      const loopTiming = this.calculateLoopTiming(phase);
      const remainingPlaybackTime = loopTiming.remainingTime;
      const loopRestartPhase = loopTiming.restartPhase;

      if (loop) {
        this.cycleEndTimerId = setTimeout(
          () => {
            this.restartCSoundMaster(loopRestartPhase);
            this.triggerNotes(loopRestartPhase);
          },
          remainingPlaybackTime * 1000,
        );
      } else {
        this.cycleEndTimerId = setTimeout(() => {
          console.log("=== NATURAL PLAYBACK END ===");
          console.log("Phase before reset:", this.phase);
          this.resetPlay(true);
          console.log("Phase after reset:", this.phase);
        }, remainingPlaybackTime * 1000);
      }

      if (!pitchTimeArrayLengthsMatch) {
        console.warn(
          `pitch not rendered: [pitchArray length, timeArray length]: [${[
            this.pitchArray.length,
            this.timeArray.length,
          ].join()}]`,
        );
      }

      if (selectionMode === CONNECT_MODE) {
        const pitchArrayById = this.pitchArray.reduce(
          (res, v) => ((res[v.id] = v), res),
          {},
        );
        
        // Handle flat datasets where connectByCollIds is null or empty
        if (!this.state.connectByCollIds || this.state.connectByCollIds.length === 0) {
          // For flat datasets, treat all cases as one continuous group
          let timeArrayForGroup = this.timeArray.slice().sort((a, b) => a.val - b.val);
          
                      // For selection-scoped playback, we need to handle non-contiguous selections properly
            if (this.isSelectionScoped) {
              // Keep all cases in temporal sequence but create silent gaps for unselected cases
              // This maintains accurate timing while creating silence for unselected regions
              timeArrayForGroup = timeArrayForGroup.filter(item => 
                this.shouldIncludeInSelectionScope(item)
              );
            }

          // Skip if insufficient cases for continuous playback
          if (timeArrayForGroup.length < 2) {
            return;
          }

          for (let i = 0; i < timeArrayForGroup.length - 1; i++) {
            const startTime = (timeArrayForGroup[i].val - phase) / gkfreq;
            const endTime = (timeArrayForGroup[i + 1].val - phase) / gkfreq;
            const timeDelta = endTime - startTime;
            const startPitch =
              pitchArrayById[timeArrayForGroup[i].id]?.val ?? 0.5;
            const endPitch =
              pitchArrayById[timeArrayForGroup[i + 1].id]?.val ?? 0.5;

            // Use unmute to create silent gaps for unselected cases
            // This ensures continuous playback while maintaining selection highlighting
            const unmute = this.getUnmuteValue(timeArrayForGroup[i]);

            // Use a numeric group ID for flat datasets (CSound requires numeric IDs)
            const groupId = 1;
            const hold = i === timeArrayForGroup.length - 2 ? timeDelta : -1;

            const csoundEvent = `i 4.${groupId} ${startTime} ${hold} ${unmute} ${startPitch} ${endPitch} ${timeDelta}`;

            if (![startTime, timeDelta, startPitch, endPitch].some(isNaN)) {
              csound.Event(csoundEvent);
            }
          }
        } else {
          // Handle hierarchical datasets with collection groups
          this.state.connectByCollIds.forEach((id) => {
            let timeArrayForGroup = this.timeArray.filter(
              (v) => v.parent === id,
            );
            
                          // For selection-scoped playback, handle non-contiguous selections properly
              if (this.isSelectionScoped) {
                // Keep all cases in temporal sequence but create silent gaps for unselected cases
                // This maintains accurate timing while creating silence for unselected regions
                timeArrayForGroup = timeArrayForGroup.filter(item => 
                  this.shouldIncludeInSelectionScope(item)
                );
              }

            // Skip if insufficient cases for continuous playback
            if (timeArrayForGroup.length < 2) {
              return;
            }

            for (let i = 0; i < timeArrayForGroup.length - 1; i++) {
              const startTime = (timeArrayForGroup[i].val - phase) / gkfreq;
              const endTime = (timeArrayForGroup[i + 1].val - phase) / gkfreq;
              const timeDelta = endTime - startTime;
              const startPitch =
                pitchArrayById[timeArrayForGroup[i].id]?.val ?? 0.5;
              const endPitch =
                pitchArrayById[timeArrayForGroup[i + 1].id]?.val ?? 0.5;

                              // Use unmute to create silent gaps for unselected cases
                // This ensures continuous playback while maintaining selection highlighting
                const unmute = this.getUnmuteValue(timeArrayForGroup[i]);

              // The last event of the group should not "hold" the note
              // as there might be other groups (voices) that would play
              // past the endTime, resulting in an incorrectly held note.
              const hold = i === timeArrayForGroup.length - 2 ? timeDelta : -1;

              if (![startTime, timeDelta, startPitch, endPitch].some(isNaN)) {
                csound.Event(
                  `i 4.${id} ${startTime} ${hold} ${unmute} ${startPitch} ${endPitch} ${timeDelta}`,
                );
              }
            }
          });
        }
      } else {
        this.timeArray.forEach((d, i) => {
          const pitch = pitchTimeArrayLengthsMatch
            ? this.pitchArray[i].val
            : 0.5;
          // let duration = this.durationArray.length === this.timeArray.length ? this.durationArray[i].val : 0.5;
          // let loudness = this.loudnessArray.length === this.timeArray.length ? this.loudnessArray[i].val * 0.95 + 0.05 : 0.5;
          // let stereo = this.stereoArray.length === this.timeArray.length ? this.stereoArray[i].val : 0.5;

          const loudness = 0.5;
          const duration = defaultNoteDuration;

          // For selection-scoped playback, only trigger notes for selected cases
          // This creates silent gaps for unselected cases while maintaining accurate timing
          const shouldTrigger = this.isSelectionScoped 
            ? (d.selected && d.val >= phase) 
            : (d.val >= phase);

          if (shouldTrigger && ![d.val, pitch].some(isNaN)) {
            if (selectionMode === CONTRAST_MODE) {
              const instr = d.sel ? 3 : 2;
              csound.Event(
                `i${instr} ${
                  (d.val - phase) / gkfreq
                } ${duration} ${pitch} ${loudness}`,
              );
            } else if (selectionMode === FOCUS_MODE) {
              csound.Event(
                `i2 ${
                  (d.val - phase) / gkfreq
                } ${duration} ${pitch} ${loudness}`,
              );
            }
          }
        });
      }
    },
    setupSound() {
      this.trackerInitialized = true;
      console.log("=== SETUPSOUND CALLED ===");
      console.log("Phase at start:", this.phase);
      
      this.stop();

      return csound.PlayCsd(this.selectedCsd).then(() => {
        console.log("CSound started, setting up...");
        this.playing = true;
        this.startTime = Date.now();
        csound.SetChannel("playbackSpeed", this.state.playbackSpeed);
        csound.SetChannel("click", this.state.loop ? 1 : 0); // Loop is now also mapped to click on/off.
        
        // Determine initial phase - use selection start only when starting fresh, not resuming
        let initialPhase = this.phase;
        if (this.isSelectionScoped && this.selectedTimeRange && this.phase === 0) {
          // Only override with selection start if we're starting from the beginning (phase === 0)
          const selectionPhaseRange = this.calculateSelectionPhaseRange();
          if (selectionPhaseRange && selectionPhaseRange.isValid) {
            initialPhase = selectionPhaseRange.startPhase;
            console.log("Using selection start phase for fresh start:", initialPhase);
          }
        } else {
          console.log("Using saved phase for resume:", initialPhase);
        }
        
        // Ensure phase channel is properly initialized before starting
        try {
          csound.SetChannel("phase", initialPhase);
          console.log("Set phase channel to:", initialPhase);
        } catch (ex) {
          console.warn("Could not set initial phase channel:", ex);
        }
        
        csound.Event(`i1 0 -1 ${initialPhase}`);
        console.log("Started MASTER instrument with phase:", initialPhase);

        this.timerId = setInterval(() => {
          this.updateTracker();
        }, 33); // 30 FPS

        if (this.timeArray.length !== 0) {
          this.triggerNotes(initialPhase);
        }
      });
    },
    play() {
      this.trackerInitialized = true;
      console.log("=== PLAY CALLED ===");
      console.log("Current phase:", this.phase);
      console.log("Playing state:", this.playing);
      console.log("Button state:", this.playPauseButton.state);
      
      if (!this.csoundReady) {
        // if (this.playToggle.state === PLAY_TOGGLE_PLAYING)
        //   this.playToggle.state = PLAY_TOGGLE_IDLE;
        this.setUserMessage("DG.plugin.sonify.notReadyMessage");
        return null;
      }

      if (!this.state.pitchAttribute || !this.state.timeAttribute) {
        // if (this.playToggle.state === PLAY_TOGGLE_PLAYING)
        //   this.playToggle.state = PLAY_TOGGLE_IDLE;
        this.setUserMessage("DG.plugin.sonify.missingPitchOrTimeMessage");
        return null;
      }

      // Determine if playback should be selection-scoped and initialize phase accordingly
      const shouldUseSelectionScope = this.hasSelectedCases() && this.selectedTimeRange !== null;
      
      if (shouldUseSelectionScope && !this.isSelectionScoped) {
        // Transitioning from full-dataset to selection-scoped playback
        console.log("Transitioning to selection-scoped playback");
        this.isSelectionScoped = true;
        
        // Reset phase to selection start for new selection-scoped playback
        const selectionPhaseRange = this.calculateSelectionPhaseRange();
        if (selectionPhaseRange && selectionPhaseRange.isValid) {
          this.phase = selectionPhaseRange.startPhase;
          console.log("Reset phase to selection start:", this.phase);
        }
      } else if (!shouldUseSelectionScope && this.isSelectionScoped) {
        // Transitioning from selection-scoped to full-dataset playback
        console.log("Transitioning to full-dataset playback");
        this.isSelectionScoped = false;
        
        // Reset phase to beginning for full-dataset playback
        this.phase = 0;
        console.log("Reset phase to dataset start:", this.phase);
      } else if (shouldUseSelectionScope && this.isSelectionScoped) {
        // Continuing selection-scoped playback - ensure we start at selection start if phase is 0
        if (this.phase === 0) {
          const selectionPhaseRange = this.calculateSelectionPhaseRange();
          if (selectionPhaseRange && selectionPhaseRange.isValid) {
            this.phase = selectionPhaseRange.startPhase;
            console.log("Starting selection-scoped playback at selection start:", this.phase);
          }
        }
      }

      if (CSOUND_AUDIO_CONTEXT.state !== "running") {
        return CSOUND_AUDIO_CONTEXT.resume().then(this.setupSound);
      } else {
        return this.setupSound();
      }
    },
    stop() {
      if (!this.csoundReady) {
        return null;
      }

      console.log("=== STOP CALLED ===");
      console.log("Playing state before stop:", this.playing);
      
      this.timerId && clearInterval(this.timerId);
      csound.Stop();
      csound.Csound.reset(); // Ensure the playback position, etc. are reset.
      this.playing = false;

      console.log("Playing state after stop:", this.playing);

      this.cycleEndTimerId && clearTimeout(this.cycleEndTimerId);
      this.cycleEndTimerId = null;
    },
    openInfoPage() {
      this.setUserMessage("DG.plugin.sonify.openInfoMessage");
      helper.openSharedInfoPage();
    },
    restoreSavedState(state) {
      Object.keys(state).forEach((key) => {
        this.state[key] = state[key];
      });
      if (this.state.playbackSpeed != null) {
        this.speedSlider.value = this.state.playbackSpeed;
      }
      if (this.state.loop != null) {
        this.loopToggle.state = this.state.loop;
      }
      if (this.state.smoothSound != null) {
        this.smoothSoundToggle.state = this.state.smoothSound;
      }
      helper
        .queryAllData()
        .then(this.onGetData)
        .then(() => {
          if (this.state.focusedContext) {
            this.attributes = helper.getAttributeNamesForContext(
              this.state.focusedContext,
            );
          }
          kAttributeMappedProperties.forEach((p) => {
            if (this.state[p + "Attribute"]) {
              this.processMappedAttribute(p);
            }
          });
        });
    },
    handleCODAPNotice(notice) {
      // console.log(`CODAP Notice: ${JSON.stringify(notice)}`)
      if (!helper.checkNoticeIdentity(notice)) {
        return null;
      }

      if (notice.resource === "documentChangeNotice") {
        helper.queryAllData().then(this.onGetData);
      } else if (notice.resource.includes("dataContextChangeNotice")) {
        let contextName = notice.resource.split("[").pop().split("]")[0];
        let operation = notice.values.operation;

        if (operation === "updateDataContext") {
          helper.queryContextList().then(() => {
            this.contexts = helper.getContexts();
          });
        } else if (operation === "updateAttributes") {
          this.resetPlay(true);
          this.onGetData();
        } else {
          if (operation === "selectCases") {
            if (contextName === this.state.focusedContext) {
              this.getSelectedItems(this.state.focusedContext).then(
                this.onItemsSelected,
              );
            }
          } else if (
            [
              "createCases",
              "deleteCases",
              "updateCases",
              "createCollection",
              "deleteCollection",
              "moveAttribute",
            ].includes(operation)
          ) {
            helper.queryDataForContext(contextName).then(this.onGetData);
          }
        }
      }
    },
    createGraph() {
      let timeAttr = this.state.timeAttribute;
      let pitchAttr = this.state.pitchAttribute;
      if (timeAttr && pitchAttr) {
        // create the graph object
        helper
          .createGraph(
            this.state.focusedContext,
            this.state.timeAttribute,
            this.state.pitchAttribute,
          )
          .then((result) => {
            if (result.success) {
              let graphId = result.values.id;
              console.log(`created graph: graph id: ${graphId}`);
              helper.setupGraphAdornments(graphId, trackingGlobalName);
            } else {
              console.warn(
                `create graph failure: ${
                  result.values ? result.values.error : "unknown error"
                }`,
              );
            }
          });
      }
    },
    tr(key, args) {
      return this.l.tr(key, args);
    },
    getContextTitle(contextName) {
      return helper.getContextTitle(contextName);
    },
    async getSelectedItems(context) {
      let isStrict = [CONTRAST_MODE].includes(this.state.selectionMode);
      return await helper.getSelectedItems(context, !isStrict);
    },

    /**
     * Calculate min/max time values among selected cases using this.timeArray
     * @returns {Object|null} Object with min and max time values, or null if no selection
     */
    getSelectedCaseBounds() {
      if (!this.timeArray || this.timeArray.length === 0) {
        return null;
      }

      // Filter for selected cases (check for 'selected' property or 'sel' property)
      let selectedCases = this.timeArray.filter(item => 
        item.selected === true || item.sel === true
      );

      // Handle edge case: if no cases are explicitly selected, 
      // treat all cases as selected in non-strict modes
      if (selectedCases.length === 0) {
        const isStrict = [CONTRAST_MODE].includes(this.state.selectionMode);
        if (!isStrict) {
          selectedCases = this.timeArray;
        } else {
          return null;
        }
      }

      // Find min and max time values among selected cases
      const timeValues = selectedCases
        .map(item => item.val)
        .filter(val => !isNaN(val));

      if (timeValues.length === 0) {
        return null;
      }

      const min = Math.min(...timeValues);
      const max = Math.max(...timeValues);

      return {
        min: min,
        max: max,
        count: selectedCases.length,
        // Edge case flags for easier handling
        isSingleCase: selectedCases.length === 1,
        isAllCases: selectedCases.length === this.timeArray.length,
        isNoExplicitSelection: selectedCases === this.timeArray
      };
    },

    /**
     * Check if any cases are currently selected
     * @returns {boolean} True if any cases are selected
     */
    hasSelectedCases() {
      if (!this.timeArray || this.timeArray.length === 0) {
        return false;
      }

      const selectedCount = this.timeArray.filter(item => 
        item.selected === true || item.sel === true
      ).length;

      // Handle edge case: if no cases are explicitly selected, 
      // check if we should treat all cases as selected (depends on selection mode)
      if (selectedCount === 0) {
        // In non-strict modes, no selection means all are selected
        const isStrict = [CONTRAST_MODE].includes(this.state.selectionMode);
        return !isStrict;
      }

      return selectedCount > 0;
    },

    /**
     * Get time range for selected cases
     * @returns {Object|null} Object with min, max, and range properties, or null if no selection
     */
    getSelectedTimeRange() {
      const bounds = this.getSelectedCaseBounds();
      if (!bounds) {
        return null;
      }

      return {
        min: bounds.min,
        max: bounds.max,
        range: bounds.max - bounds.min,
        count: bounds.count
      };
    },

    /**
     * Convert a time value to its corresponding phase value (0-1)
     * @param {number} timeValue - Normalized time value (0-1) from timeArray
     * @returns {number} Phase value (0-1)
     */
    calculatePhaseForTimeValue(timeValue) {
      if (isNaN(timeValue) || timeValue < 0 || timeValue > 1) {
        return 0;
      }

      // Account for time attribute scaling (date vs numeric)
      const timeAdj = this.state.timeAttrIsDate ? 1000 : 1;
      
      // Account for selection mode compression
      const modeAdj = this.state.selectionMode === CONNECT_MODE
        ? 1
        : (this.timeAttrRange?.len - 1) / this.timeAttrRange?.len || 1;

      // Convert normalized time value to phase
      return timeValue * modeAdj;
    },

    /**
     * Calculate start and end phases for the current selection
     * @returns {Object|null} Object with startPhase and endPhase, or null if no selection
     */
    calculateSelectionPhaseRange() {
      const selectedTimeRange = this.getSelectedTimeRange();
      if (!selectedTimeRange) {
        return null;
      }

      // Handle edge case where selection is at dataset boundaries
      const startPhase = this.calculatePhaseForTimeValue(selectedTimeRange.min);
      const endPhase = this.calculatePhaseForTimeValue(selectedTimeRange.max);

      // Ensure valid phase range
      const validStartPhase = Math.max(0, Math.min(1, startPhase));
      const validEndPhase = Math.max(0, Math.min(1, endPhase));

      return {
        startPhase: validStartPhase,
        endPhase: validEndPhase,
        range: validEndPhase - validStartPhase,
        isValid: validEndPhase > validStartPhase
      };
    },

    /**
     * Calculate the duration of selection-scoped playback in seconds
     * @returns {number} Duration in seconds, or 0 if no selection
     */
    calculateSelectionPlaybackDuration() {
      if (!this.isSelectionScoped || !this.selectedTimeRange) {
        return 0;
      }

      const selectionPhaseRange = this.calculateSelectionPhaseRange();
      if (!selectionPhaseRange || !selectionPhaseRange.isValid) {
        return 0;
      }

      // Calculate duration based on selection phase span and playback speed
      const selectionPhaseSpan = selectionPhaseRange.endPhase - selectionPhaseRange.startPhase;
      
      // Convert playback speed to frequency
      let gkfreq = expcurve(this.state.playbackSpeed, 50);
      gkfreq = expcurve(gkfreq, 50);
      gkfreq = scale(gkfreq, 5, 0.05);

      // Duration = phase span / frequency
      return selectionPhaseSpan / gkfreq;
    },

    /**
     * Calculate loop timing parameters for current playback state
     * @param {number} currentPhase - Current CSound phase
     * @returns {Object} Object with remainingTime and restartPhase
     */
    calculateLoopTiming(currentPhase) {
      let gkfreq = expcurve(this.state.playbackSpeed, 50);
      gkfreq = expcurve(gkfreq, 50);
      gkfreq = scale(gkfreq, 5, 0.05);

      if (this.isSelectionScoped && this.selectedTimeRange) {
        const selectionPhaseRange = this.calculateSelectionPhaseRange();
        if (selectionPhaseRange && selectionPhaseRange.isValid) {
          // Calculate remaining time within selection range
          // currentPhase already represents the actual position in the dataset timeline
          // Add extra time for the last note to complete (note duration = 0.2 seconds)
          const noteDuration = defaultNoteDuration;
          const remainingTime = (selectionPhaseRange.endPhase - currentPhase) / gkfreq + noteDuration * 1.5;
          return {
            remainingTime: remainingTime,
            restartPhase: selectionPhaseRange.startPhase
          };
        }
      }
      
      // Normal behavior: use full dataset range
      // Add extra time for the last note to complete (note duration = 0.2 seconds)
      const noteDuration = defaultNoteDuration;
      return {
        remainingTime: (1 - currentPhase) / gkfreq + noteDuration * 1.5,
        restartPhase: 0
      };
    },

    /**
     * Analyze the current selection pattern for non-contiguous gaps
     * @returns {Object} Analysis of selection patterns and gaps
     */
    analyzeSelectionPattern() {
      if (!this.timeArray || this.timeArray.length === 0) {
        return { hasSelection: false, isContiguous: true, gaps: [] };
      }

      // Sort by time value to analyze temporal sequence
      const sortedTimeArray = this.timeArray.slice().sort((a, b) => a.val - b.val);
      const selectedCases = sortedTimeArray.filter(item => item.selected);
      
      if (selectedCases.length === 0) {
        return { hasSelection: false, isContiguous: true, gaps: [] };
      }

      if (selectedCases.length === 1) {
        return { hasSelection: true, isContiguous: true, gaps: [], singleCase: true };
      }

      // Analyze gaps between selected cases
      const gaps = [];
      let isContiguous = true;
      
      for (let i = 0; i < selectedCases.length - 1; i++) {
        const currentCase = selectedCases[i];
        const nextCase = selectedCases[i + 1];
        
        // Find cases between current and next selected case
        const casesBetween = sortedTimeArray.filter(item => 
          item.val > currentCase.val && 
          item.val < nextCase.val && 
          !item.selected
        );
        
        if (casesBetween.length > 0) {
          isContiguous = false;
          gaps.push({
            startTime: currentCase.val,
            endTime: nextCase.val,
            gapSize: casesBetween.length,
            unselectedCases: casesBetween.map(c => c.id)
          });
        }
      }

      return {
        hasSelection: true,
        isContiguous,
        gaps,
        totalSelected: selectedCases.length,
        totalCases: sortedTimeArray.length,
        selectionRatio: selectedCases.length / sortedTimeArray.length
      };
    },

    /**
     * Determine if a case should be included in selection-scoped note generation
     * @param {Object} caseItem - Case item with val, selected, and other properties
     * @returns {boolean} True if case should be included in note generation
     */
    shouldIncludeInSelectionScope(caseItem) {
      if (!this.isSelectionScoped || !this.selectedTimeRange) {
        return true; // Include all cases when not in selection-scoped mode
      }

      // Include selected cases and unselected cases within selection time range
      // This maintains temporal accuracy while creating silent gaps for unselected cases
      return caseItem.selected || (
        caseItem.val >= this.selectedTimeRange.min && 
        caseItem.val <= this.selectedTimeRange.max
      );
    },

    /**
     * Get the appropriate unmute value for a case in selection-scoped playback
     * @param {Object} caseItem - Case item with selected property
     * @returns {number} 1 for audible, 0 for silent
     */
    getUnmuteValue(caseItem) {
      // In selection-scoped mode, only selected cases should be audible
      // In normal mode, all cases should be audible
      if (this.isSelectionScoped) {
        return caseItem.selected ? 1 : 0;
      }
      return 1;
    },


  },
  async mounted() {
    this.setupDrag();
    this.setupUI();

    this.trackerInitialized = false;
    let state = await helper.init(this.name, this.dim, this.version);
    if (state && Object.keys(state).length) {
      this.restoreSavedState(state);
    } else {
      this.onGetData();
    }

  await helper.guaranteeGlobal(trackingGlobalName);
    this.updateTracker();
    // Set sonificationTracker to -999999 after all state/data is loaded
    helper.setGlobal(trackingGlobalName, -999999);

    helper.on("*", this.handleCODAPNotice);

    this.selectedCsd = this.csdFiles[0];
  },
  async beforeMount() {
    await localeManager.init();
  },
  computed: {
    isPlayable: function () {
      let playable = !!(this.state.timeAttribute && this.state.pitchAttribute);
      console.log(`playable = ${playable}`);
      return playable;
    },
  },
});

window.moduleDidLoad = function () {
  let loadingScreen = document.getElementsByClassName("loading-screen");
  loadingScreen[0].parentNode.removeChild(loadingScreen[0]);

  app.csoundReady = true;
  // app.play();
};
