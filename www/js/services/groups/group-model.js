function GroupModel () {
  this.fillWith = function(data){
    $.extend(this, data)
    this.upper_title = this.official_title.toUpperCase();
  }


}