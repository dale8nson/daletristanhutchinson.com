const startDTHAnim = (node) => {
  const anims = node.getAnimations({subtree:true});
  anims.forEach(anim =>  console.log(anim));
  const firstLetter = anims.find(anim => anim.effect.target.id === 'p-1');
  firstLetter.ready.then(() => firstLetter.play());
}

const nextAnimation = () => {

}

onmessage = (e) => {

  switch (e.data.msg) {
    case "dTHRef":
      const ref = e.data.ref;
      const anim = ref.current.getAnimations().find(anim => anim.effect.target.id ==='p-1');
      anim.play();
      break;
    
    case "nextAnim":

  }
  
}

export default anim