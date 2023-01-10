<template>
  <div class="about flex">
    <div class="block ml-auto mr-auto">
      <h1>The game</h1>
      <p class="text">
        This is a really simple game called "White" that requires a group of minimum 4 players that can communicate with one another. One of them will be the "narrator" (or the "admin", as it is referred to in this application) and the rest will be the "players". In each round, the narrator will choose a minimum of one of the players and designate them as "white". Then, the narrator will choose a word or a single concept which will be shared to the rest of the players except for the "white" one(s) in secret. All the players will then, by turns, say a word or concept related to the initial one. Afterwards, they will have to vote which among them they think it is a "white". The player who gets the most votes will be eliminated and the game will continue until there are no more "whites" left or there are the same amount of "whites" as players. The goal of the players is to find out who the "whites" are and eliminate all of them, while the goal of the "whites" is to survive until the end. As an additional rule, if a "white" says exactly the same word as the initial one, they will instantly win the game. Moreover, if a player says the initial word exactly, all players will lose.
      </p>
    </div>
    <div class="block ml-auto mr-auto">
      <h1>The developer</h1>
      <p class="text">
        My name is Carlos Ferrús, a computer scientist from Alicante, Spain. I hold a Degree in Computer Science specialized in Software Engineering and a Masters Degree in Cybersecurity. I spend my free time developing a variety of projects, from tiny automation scripts to full-fledged web applications. I also enjoy traveling, as shown in the picture taken in Lanzarote. You can find the source code of this application in my GitHub as well as other projects I have worked on. I can also be contacted through LinkedIn and email with the appropriate buttons. I hope you enjoy this game as much as I enjoyed developing it!
      </p>
      <div class="img-container mr-auto ml-auto">
        <img src="@/assets/pic.jpg" alt="Me" class="pic mt-1">
        <div class="flex spread">
          <a href="https://www.linkedin.com/in/carlos-ferrus/"><font-awesome-icon :icon="['fab', 'linkedin']" class="icon"></font-awesome-icon></a>
          <a href="mailto:carlos@ferrus.es"><font-awesome-icon :icon="['fas', 'envelope']" class="icon"></font-awesome-icon></a>
          <a href="https://github.com/charlitosf"><font-awesome-icon :icon="['fab', 'github']" class="icon"></font-awesome-icon></a>
        </div>
      </div>
    </div>
    
  </div>
</template>

<style>
.about {
  flex-direction: row;
  flex-wrap: wrap;
}

.block {
  min-width: 350px;
  max-width: 50%;
  padding: 30px;
  text-align: center;
}

.text {
  text-align: justify;
}

.pic {
  max-width: 400px;
  min-width: 330px;
}

.icon {
  font-size: 40px;
}

.img-container {
  width: min-content;
}

@media screen and (max-width: 1000px) {
  .icon {
    font-size: 3.5vw;
  }

  .pic {
    max-width: 280px;
    min-width: 250px;
  }
}

@media screen and (max-width: 700px) {
  .icon {
    font-size: 30px;
  }

  .pic {
    max-width: 330px;
  }

  .block {
    padding: 10px;
  }
}




</style>
