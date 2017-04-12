//This algorithm assumes the input is valid because when this script is used by home.html, the input has been checked.

var Result = { "win": 1, "loss": 2, "tie": 3 };

//PokerHand Constructor, contains methods that check for the type of hand
function PokerHand(hand) {
    this.suit_array = [ hand[0].charAt(1), hand[1].charAt(1), hand[2].charAt(1), hand[3].charAt(1), hand[4].charAt(1)];
    this.num_array = function () {
        var tmp = [];
        for (var i = 0; i< hand.length; i++) {
            switch (hand[i].charAt(0)){
                case "A":
                    tmp.push(14);
                    break;
                case "T":
                    tmp.push(10);
                    break;
                case "J":
                    tmp.push(11);
                    break;
                case "Q":
                    tmp.push(12);
                    break;
                case "K":
                    tmp.push(13);
                    break;
                default:
                    tmp.push(Number(hand[i].charAt(0)));
                                     }
            }
        return tmp;
    }
    
    this.get_num_frequency = function () {
        var counter = {};
        for (var i = 0; i<this.num_array().length; i++) {
            var num = this.num_array()[i];
            counter[num] = counter[num] ? counter[num]+1 : 1;
        }
        return counter;
    }
    this.is_flush = function () {
        var counter = {};
        for (var i = 0; i< this.suit_array.length; i++) {
            var num = this.suit_array[i];
            counter[num] = counter[num] ? counter[num]+1 : 1;
        }
        return Object.keys(counter).length == 1;
    }
    this.is_straight = function () {
        if (Object.keys(this.get_num_frequency()).length == 5) {
            var offset = 0;
            for (var i = 0; i< this.num_array().length; i++) {
                offset = offset - this.num_array()[i];
            }
            var max_of_array = Math.max.apply(Math, this.num_array());
            offset = offset + 5*max_of_array;
            return offset == 10 || offset === 42;
        }
        else{
            return false;
        }
    }
    this.is_straight_flush = function () {
        return this.is_straight() && this.is_flush();
    }
    this.is_carre = function () {
        return Object.values(this.get_num_frequency()).includes(4);
    }
    this.is_three = function () {
        return Object.keys(this.get_num_frequency()).length == 3 && Object.values(this.get_num_frequency()).includes(3);
    }
    this.is_two_pair = function() {
        return Object.keys(this.get_num_frequency()).length == 3 && Object.values(this.get_num_frequency()).includes(2);
    }
    this.is_one_pair = function() {
        return Object.keys(this.get_num_frequency()).length == 4;
    }
    this.is_full_house = function() {
        return  Object.keys(this.get_num_frequency()).length == 2 && Object.values(this.get_num_frequency()).includes(3);
    }
    this.is_high_card = function() {
        return (Object.keys(this.get_num_frequency()).length == 5 && !this.is_straight());
    }
}

//Compares two PokerHand Objects
//Check first for tie then its either loss or win
PokerHand.prototype.compareWith = function (hand) {
    //TIE 
    var k=0;
    for (var i = 0; i<this.num_array().length; i++) {
        if (this.num_array().sort()[i] != hand.num_array().sort()[i]){
            k=1;
        }
    }
    if (k == 0 && this.is_flush() == hand.is_flush()) {
        return Result.tie;
    }
    //SAME COMBO, CHECK HIGH CARD
    else if (this.isSameCombo(hand)){
        return this.highCard(hand);
    }
    //Different Combo, find if this is winner
    //Royal Flush
    else if (this.is_straight_flush() && this.num_array().includes(14) && this.num_array().includes(13)){
            return Result.win;
    }
    //Straight Flush
    else if (this.is_straight_flush()){
        if (!hand.is_straight_flush()){
            return Result.win;
        }
        else {
            return Result.loss;
        }
    }
    //Four of a kind
    else if (this.is_carre()) {
        if (!hand.is_carre() && !hand.is_straight_flush()) {
            return Result.win;
        }
        else {
            return Result.loss;
        }
    }
    //Full House
    else if (this.is_full_house()) {
        if (!hand.is_full_house() && !hand.is_carre() && !hand.is_straight_flush()) {
            return Result.win;
        }
        else {
            return Result.loss;
        }
    }
    //Flush
    else if (this.is_flush()) {
        if (!hand.is_flush() && !hand.is_full_house() && !hand.is_carre() && !hand.is_straight_flush()) {
            return Result.win;
        }
        else {
            return Result.loss;
        }
    }
    //Straight
    else if (this.is_straight()) {
        if (hand.is_high_card() || hand.is_one_pair() || hand.is_two_pair() || hand.is_three()) {
            return Result.win;
        }
        else {
            return Result.loss;
        }
    }
    //Three of a Kind
    else if (this.is_three()) {
        if (hand.is_high_card() || hand.is_one_pair() || hand.is_two_pair()) {
            return Result.win;
        }
        else {
            return Result.loss;
        }
    }
    //Two Pairs
    else if (this.is_two_pair()) {
        if (hand.is_high_card() || hand.is_one_pair()) {
            return Result.win;
        }
        else {
            return Result.loss;
        }
    }
    //Pair
    else if (this.is_one_pair()) {
        if (hand.is_high_card()) {
            return Result.win;
        }
        else {
            return Result.loss;
        }
    }
    //High Card
    else {
        return Result.loss;
    }
}

//Checks if two PokerHand objects form the same poker hand
PokerHand.prototype.isSameCombo = function (hand) {
    return (this.is_straight_flush() == hand.is_straight_flush() && this.is_carre() == hand.is_carre() && this.is_full_house() == hand.is_full_house() && this.is_flush() == hand.is_flush() && this.is_straight() == hand.is_straight() && this.is_three() == hand.is_three() && this.is_two_pair() == hand.is_two_pair() && this.is_one_pair() == hand.is_one_pair() && this.is_high_card() == hand.is_high_card());
}

//Checks which of the hands wins on high card
PokerHand.prototype.highCard = function (hand) {
    var count1 = this.get_num_frequency();
    var count2 = hand.get_num_frequency();
    var a=0;
    var b=0;
    var c = [];
    var d = [];
    //High Card, Straight, Flush
    if (this.is_high_card() || this.is_straight() ||this.is_flush()){
        c = this.num_array().sort(function(a, b){return b-a});
        d = hand.num_array().sort(function(a, b){return b-a});
        if (this.is_straight()){
            if (c[0] == 14 && d[0] != 14){
                if (c[1] == 13){
                    return Result.win;
                }
                else {
                    return Result.loss
                }
            }
            else if (c[0] != 14 && d[0] == 14){
                if (d[1] == 13){
                    return Result.loss;
                }
                else {
                    return Result.win;
                }
            }
        }
        for (var i=0; i< this.num_array().length; i++) {
            if (c[i] > d[i]){
                return Result.win;
            }
            else if (c[i] == d[i]){
                continue;
            }
            else {
                return Result.loss;
            }
        }
    }
    //Four of a Kind, Three of a Kind, One Pair
    else if (this.is_carre() || this.is_three() || this.is_one_pair()){
        for (var i=0; i< this.num_array().length; i++) {
            if (count1[this.num_array()[i]] > 1) {
                a = this.num_array()[i];
            }
            if (count2[hand.num_array()[i]] > 1) {
                b = hand.num_array()[i];
            }
        }
        if (a>b){
            return Result.win;
        }
        else if (a == b && this.is_one_pair() ){
            c = this.num_array().sort(function(a, b){return b-a});
            d = hand.num_array().sort(function(a, b){return b-a});
            for (var i=0; i< this.num_array().length; i++) {
                if (c[i]>d[i]) {
                    return Result.win;
                }
                else if (c[i]<d[i]) {
                    return Result.loss;
                }
                else {
                    continue;
                }
            }
        }
        else {
            return Result.loss;
        }
    }
    //Two Pairs
    else if (this.is_two_pair()){
        for (var i=0; i< this.num_array().length; i++) {
            if (count1[this.num_array()[i]] > 1) {
                c.push(this.num_array()[i]);
            }
            if (count1[this.num_array()[i]] == 1){
                a = this.num_array()[i];
            }
            if (count2[hand.num_array()[i]] > 1) {
                d.push(hand.num_array()[i]);
            }
            if (count2[hand.num_array()[i]] == 1){
                b = hand.num_array()[i];
            }
        }
        if (Math.max.apply(Math, c) == Math.max.apply(Math, d)){
            if (Math.min.apply(Math, c) == Math.min.apply(Math, d)){
                if (a>b){
                    return Result.win;
                }
                else{
                    return Result.loss;
                }
            }
            else if (Math.min.apply(Math, c) > Math.min.apply(Math, d)){
                return Result.win;
            }
            else {
                return Result.loss;
            }
        }
        else if (Math.max.apply(Math, c) > Math.max.apply(Math, d)){
            return Result.win;
        }
        else {
            return Result.loss;
        }
    }
    //Full House
    else {
        for (var i=0; i< this.num_array().length; i++) {
            if (count1[this.num_array()[i]] == 3){
                a = this.num_array()[i];
            }
            if (count2[hand.num_array()[i]] == 3){
                b = hand.num_array()[i];
            }
        }
        if (a>b) {
            return Result.win;
        }
        else{
            return Result.loss;
        }
    }
}