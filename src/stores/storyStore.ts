/**
 * 剧情/对话状态 Store
 * 管理当前节点、对话队列、对话进度、选择状态等
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { StoryNode, Dialogue, ChoiceUnlock } from '@/types/story';
import { useGameStore } from './gameStore';

export const useStoryStore = defineStore('story', () => {
  // === State ===
  /** 当前剧情节点 */
  const currentNode = ref<StoryNode | null>(null);
  /** 当前对话队列 */
  const dialogues = ref<Dialogue[]>([]);
  /** 当前对话索引 */
  const dialogueIndex = ref(0);
  /** 是否正在等待玩家选择 */
  const waitingForChoice = ref(false);
  /** 是否在教学模式 */
  const tutorialMode = ref(false);
  /** 当前插画ID */
  const currentIllustration = ref<string>('');
  /** 当前播放的Lottie动画名 */
  const currentLottie = ref<string>('');
  /** 已解锁的相册条目ID列表 */
  const unlockedAlbumEntries = ref<string[]>([]);
  /** 已解锁的日记条目ID列表 */
  const unlockedDiaryEntries = ref<string[]>([]);
  /** 已解锁的道具ID列表 */
  const unlockedProps = ref<string[]>([]);
  /** 已访问的节点ID历史 */
  const storyHistory = ref<string[]>([]);

  // === Getters ===
  /** 当前对话 */
  const currentDialogue = computed(() => {
    if (dialogues.value.length === 0) return null;
    return dialogues.value[dialogueIndex.value] ?? null;
  });

  /** 对话是否全部播放完毕 */
  const isDialogueComplete = computed(() => {
    return dialogueIndex.value >= dialogues.value.length - 1;
  });

  /** 是否有对话正在播放 */
  const hasDialogues = computed(() => dialogues.value.length > 0);

  // === Actions ===

  function setCurrentNode(node: StoryNode | null) {
    currentNode.value = node;
    if (node) {
      storyHistory.value.push(node.id);
    }
  }

  function setDialogues(dialogueList: Dialogue[]) {
    dialogues.value = dialogueList;
    dialogueIndex.value = 0;
  }

  function setDialogueIndex(index: number) {
    dialogueIndex.value = index;
  }

  function advanceDialogue(): void {
    if (dialogueIndex.value < dialogues.value.length - 1) {
      dialogueIndex.value++;
    }
  }

  function setWaitingForChoice(waiting: boolean) {
    waitingForChoice.value = waiting;
  }

  function setTutorialMode(enabled: boolean) {
    tutorialMode.value = enabled;
  }

  function setCurrentIllustration(illustrationId: string) {
    currentIllustration.value = illustrationId;
  }

  function playLottie(animationName: string) {
    currentLottie.value = animationName;
  }

  function stopLottie() {
    currentLottie.value = '';
  }

  function unlockAlbumEntry(entryId: string) {
    if (!unlockedAlbumEntries.value.includes(entryId)) {
      unlockedAlbumEntries.value.push(entryId);
    }
  }

  function unlockDiaryEntry(entryId: string) {
    if (!unlockedDiaryEntries.value.includes(entryId)) {
      unlockedDiaryEntries.value.push(entryId);
    }
  }

  function unlockProp(propId: string) {
    if (!unlockedProps.value.includes(propId)) {
      unlockedProps.value.push(propId);
    }
  }

  function processUnlocks(unlocks: ChoiceUnlock[] | ChoiceUnlock) {
    const unlockList = Array.isArray(unlocks) ? unlocks : [unlocks];
    const gameStore = useGameStore();
    for (const unlock of unlockList) {
      if (unlock.albumEntryId) unlockAlbumEntry(unlock.albumEntryId);
      if (unlock.diaryEntryId) unlockDiaryEntry(unlock.diaryEntryId);
      if (unlock.propId) unlockProp(unlock.propId);
      if (unlock.flag) gameStore.setFlag(unlock.flag, true);
    }
  }

  function resetStory() {
    currentNode.value = null;
    dialogues.value = [];
    dialogueIndex.value = 0;
    waitingForChoice.value = false;
    tutorialMode.value = false;
    currentIllustration.value = '';
    currentLottie.value = '';
    storyHistory.value = [];
  }

  return {
    currentNode, dialogues, dialogueIndex, waitingForChoice, tutorialMode,
    currentIllustration, currentLottie,
    unlockedAlbumEntries, unlockedDiaryEntries, unlockedProps, storyHistory,
    currentDialogue, isDialogueComplete, hasDialogues,
    setCurrentNode, setDialogues, setDialogueIndex, advanceDialogue,
    setWaitingForChoice, setTutorialMode,
    setCurrentIllustration, playLottie, stopLottie,
    unlockAlbumEntry, unlockDiaryEntry, unlockProp, processUnlocks,
    resetStory,
  };
});
