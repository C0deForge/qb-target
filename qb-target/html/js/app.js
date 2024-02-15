const Targeting = Vue.createApp({
    data() {
        return {
            Show: false, // leave this
            ChangeTextIconColor: false, // This is if you want to change the color of the icon next to the option text with the text color
            StandardEyeIcon: "far fa-eye", // This is the default eye icon
            CurrentIcon: this.StandardEyeIcon, // leave this
            SuccessColor: "white", // This is the color when the target has found the option
            StandardColor: "white", // This is the standard color, change this to the same as the StandardColor if you have changed it
            TargetEyeStyleObject: {
                color: this.StandardColor, // leave this
            },
        }
    },
    destroyed() {
        window.removeEventListener("message", this.messageListener);
        window.removeEventListener("mousedown", this.mouseListener);
        window.removeEventListener("keydown", this.keyListener);
        window.removeEventListener("mouseover", this.mouseOverListener);
        window.removeEventListener("mouseout", this.mouseOutListener);
    },
    mounted() {
        this.targetLabel = document.getElementById("target-label");

        this.messageListener = window.addEventListener("message", (event) => {
            switch (event.data.response) {
                case "openTarget":
                    this.SetStyle(event.data.config);
                    this.OpenTarget();
                    break;
                case "closeTarget":
                    this.CloseTarget();
                    break;
                case "foundTarget":
                    this.FoundTarget(event.data);
                    break;
                case "validTarget":
                    this.ValidTarget(event.data);
                    break;
                case "leftTarget":
                    this.LeftTarget();
                    break;
            }
        });

        this.mouseListener = window.addEventListener("mousedown", (event) => {
            let element = event.target;
            if (element.id) {
                const split = element.id.split("-");
                if (split[0] === "target" && split[1] !== "eye" && event.button == 0) {
                    fetch(`https://${GetParentResourceName()}/selectTarget`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json; charset=UTF-8" },
                        body: JSON.stringify(split[2])
                    }).then(resp => resp.json()).then(_ => {});
                    this.targetLabel.innerHTML = "";
                    this.Show = false;
                }
            }

            if (event.button == 2) {
                this.LeftTarget();
                fetch(`https://${GetParentResourceName()}/leftTarget`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json; charset=UTF-8" },
                    body: ""
                }).then(resp => resp.json()).then(_ => {});
            }
        });

        this.keyListener = window.addEventListener("keydown", (event) => {
            if (event.key == "Escape" || event.key == "Backspace") {
                this.CloseTarget();
                fetch(`https://${GetParentResourceName()}/closeTarget`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json; charset=UTF-8" },
                    body: ""
                }).then(resp => resp.json()).then(_ => {});
            }
        });

        this.mouseOverListener = window.addEventListener("mouseover", (event) => {
            const element = event.target;
            if (element.id) {
                const split = element.id.split("-");
                if (split[0] === "target" && split[1] === "option") {
                    event.target.style.color = this.SuccessColor;
                    if (this.ChangeTextIconColor) document.getElementById(`target-icon-${index}`).style.color = this.SuccessColor;
                }
            }
        });

        this.mouseOutListener = window.addEventListener("mouseout", (event) => {
            const element = event.target;
            if (element.id) {
                const split = element.id.split("-");
                if (split[0] === "target" && split[1] === "option") {
                    element.style.color = this.StandardColor;
                    if (this.ChangeTextIconColor) document.getElementById(`target-icon-${index}`).style.color = this.StandardColor;
                }
            }
        });
    },
    methods: {
        OpenTarget() {
            document.getElementById('target-label-wrapper').style.display = 'none';
            this.targetLabel.innerHTML = "";
            this.Show = true;
            this.TargetEyeStyleObject.color = this.StandardColor;
        },

        CloseTarget() {
            document.getElementById('target-label-wrapper').style.display = 'none';
            this.targetLabel.innerHTML = "";
            this.TargetEyeStyleObject.color = this.StandardColor;
            this.Show = false;
            this.CurrentIcon = this.StandardEyeIcon;
        },

        FoundTarget(item) {
            if (item.data) this.CurrentIcon = item.data;
            else this.CurrentIcon = this.StandardEyeIcon;
            this.TargetEyeStyleObject.color = getComputedStyle(document.documentElement).getPropertyValue('--eyePrimary');
        },

        ValidTarget(item) {
            document.getElementById('target-label-wrapper').style.display = 'flex';
            this.targetLabel.innerHTML = "";
            for (let [index, itemData] of Object.entries(item.data)) {
                if (itemData !== null) {
                    index = Number(index) + 1;

                    if (this.ChangeTextIconColor) {
                        this.targetLabel.innerHTML +=
                        `<div class="target-wrapper" id="target-option-${index}">
                            <span class="target-icon" id="target-icon-${index}">
                                <i class="${itemData.icon}"></i>
                            </span>
                            ${itemData.label}
                        </div>`;
                    } else {
                        this.targetLabel.innerHTML +=
                        `<div class="target-wrapper" id="target-option-${index}">
                            <span class="target-icon" id="target-icon-${index}">
                                <i class="${itemData.icon}"></i>
                            </span>
                            ${itemData.label}
                        </div>`;
                    }
                }
            }
        },

        LeftTarget() {
            this.targetLabel.innerHTML = "";
            this.CurrentIcon = this.StandardEyeIcon;
            this.TargetEyeStyleObject.color = this.StandardColor;
            document.getElementById('target-label-wrapper').style.display = 'none';
        },

        SetStyle(data) {
            document.querySelector(':root').style.setProperty('--eyeBackground', data.Style.eyeBackground);
            document.querySelector(':root').style.setProperty('--eyeBorder', data.Style.eyeBorder);
            document.querySelector(':root').style.setProperty('--eyePrimary', data.Style.eyePrimary);
            document.querySelector(':root').style.setProperty('--primary', data.Style.primary);
            document.querySelector(':root').style.setProperty('--secondary', data.Style.secondary);
            document.querySelector(':root').style.setProperty('--background', data.Style.background);
            document.querySelector(':root').style.setProperty('--borderSecondary', data.Style.borderSecondary);
            document.querySelector(':root').style.setProperty('--borderPrimary', data.Style.borderPrimary);
        }
    }
});

Targeting.use(Quasar, { config: {} });
Targeting.mount("#target-wrapper");