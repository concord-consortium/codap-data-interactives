

testimate.dropManager = {

    currentlyDraggingCODAPAttribute : false,
    currentlyOverDIV : null,

    handleDragDrop : async function(iMessage) {

        switch(iMessage.values.operation) {
            case   `dragstart`:
                this.currentlyDraggingCODAPAttribute = true;
                console.log(`    drag start`);
                break;
            case   `dragend`:
                this.currentlyDraggingCODAPAttribute = false;
                testimate.dropManager.highlightNone();
                console.log(`    drag end`);
                break;
            case   `drag`:
                testimate.dropManager.handleDrag(iMessage.values.position);
                break;
            case   `drop`:
                testimate.copeWithAttributeDrop(
                    iMessage.values.context,
                    iMessage.values.attribute,
                    iMessage.values.position
                );
                break;
            case   `dragenter`:
                console.log(`    drag enter`);
                testimate.dropManager.highlightNear();
                break;
            case   `dragleave`:
                testimate.dropManager.highlightNone();
                console.log(`    drag leave`);
                break;
        }
    },

    getAttributeUnderCursor : function(iWhere) {
        const theElement = document.elementFromPoint(iWhere.x, iWhere.y);
        const theFirstClasslist = theElement.classList;
        if (theFirstClasslist.contains("attributeHint") ||
            theFirstClasslist.contains("attributeName") ||
            theFirstClasslist.contains("attributeControls")) {

        }
    },

    handleDrag : function(iWhere) {
        const currentElement = document.elementFromPoint(iWhere.x, iWhere.y);
        // console.log(`   drag over element [${currentElement.id}]`);
        if (currentElement) {
            const theElement = currentElement.closest('#xDIV, #yDIV');
            if (theElement) {
                if (theElement === ui.xDIV || theElement === ui.yDIV) {
                    if (this.currentlyOverDIV && (theElement != this.currentlyOverDIV)) {
                        this.currentlyOverDIV.classList.replace(`drag-over`, `drag-near`);
                        console.log(`    change drop zone to ${theElement.id}`);
                    }
                    this.currentlyOverDIV = theElement;
                    this.currentlyOverDIV.className = `drag-over`;

                } else {
                    this.highlightNear();
                }
            }
        }
    },

    highlightNear : function () {
        ui.xDIV.className = `drag-near`;
        ui.yDIV.className = `drag-near`;
    },

    highlightNone: function() {
        ui.xDIV.className = (testimate.state.x && testimate.state.x.name) ? `drag-none` : `drag-empty`;
        ui.yDIV.className = (testimate.state.y && testimate.state.y.name) ? `drag-none` : `drag-empty`;
        this.currentlyOverDIV = null;

    },


}