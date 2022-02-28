const period = 60 * 1000;
class ActiveManager {
    _timeoutId;
    _isActive;
    activate() {
        clearTimeout(this._timeoutId);
        this._isActive = true;
        this._timeoutId = setTimeout(() => {
            this._isActive = false;
        }, period);
    }
    isActive(){
        return this._isActive;  
    }
}

const activeManager = new ActiveManager();
export {activeManager};