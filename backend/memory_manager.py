"""
Advanced memory management system with multi-step processing pipeline.
"""

import json
from datetime import datetime, timedelta
from typing import Dict, List
import traceback

from llm import GroqClient, GroqModelConfig
from database import Database


class MemoryProcessor:
    """Handles the processing pipeline for memory management"""

    def __init__(self, db: Database, client: GroqClient):
        self.db = db
        self.client = client

    def analyze_transcriptions(
        self, transcriptions: Dict
    ) -> Dict:
        """First step: Extract topics and analyze content"""
        print("\n=== INITIAL ANALYSIS PHASE ===")

        try:
            # First, extract raw topics
            topic_prompt = f"""
You are an expert conversation analyst. Extract the main topics from these transcriptions.
Focus only on the actual content, not the metadata or structure.

Transcriptions:
{json.dumps([t.get('text', '') for t in transcriptions.values()], indent=2)}

RETURN ONLY THE JSON OBJECT BELOW - NO OTHER TEXT.
You MUST return your response in this EXACT format:
{{
    "topics": [
        {{
            "name": "clear_topic_name",
            "sentences": ["relevant sentence 1", "relevant sentence 2"],
            "emotional_tone": "brief tone description",
            "importance": 1-5
        }}
    ]
}}

REQUIREMENTS:
1. Each topic MUST have a "name" field
2. Group relevant sentences under each topic
3. Include emotional tone and importance
4. Use clear, specific topic names
5. DO NOT include any text before or after the JSON. Return ONLY the JSON object.
"""
            topic_response = self.client.generate_text(topic_prompt)
            topics = json.loads(topic_response.strip().lstrip("```json").rstrip("```"))

            print("\nExtracted Topics:")
            print(json.dumps(topics, indent=2))

            if not topics.get("topics"):
                raise ValueError("No topics extracted from transcriptions")

            # Validate topic format
            for topic in topics["topics"]:
                if "name" not in topic:
                    # Fix topic format if needed
                    topic["name"] = topic.get("topic", "Unknown Topic")

            # Then, analyze relationships and context
            context_prompt = f"""
You are a conversation context analyzer. Create conversation threads from these topics.
DO NOT repeat the input format. Create NEW conversation threads.

For each of these topics:
{json.dumps([t["name"] for t in topics["topics"]], indent=2)}

RETURN ONLY THE JSON OBJECT BELOW - NO OTHER TEXT.
Create a conversation thread analysis that follows this EXACT format:
{{
    "conversation_threads": [
        {{
            "topic": "EXACT_TOPIC_NAME_FROM_ABOVE",
            "context": "detailed context of this conversation",
            "related_memories": [],
            "sentiment": "positive/negative/neutral",
            "continuation": "new/continuing/concluding"
        }}
    ]
}}

REQUIREMENTS:
1. Use EXACT topic names from the input
2. Create one thread for EACH topic
3. Return ONLY the format shown above
4. Include "conversation_threads" as the root key
5. Do not include any other fields or formats
6. Return ONLY the JSON object above. NO text before or after.
"""
            context_response = self.client.generate_text(context_prompt)
            print("\nRaw Context Response:")
            print(context_response)

            # Try to extract JSON from the response
            try:
                # First try direct JSON parse
                context = json.loads(context_response.strip())
            except json.JSONDecodeError:
                try:
                    # Try extracting from markdown
                    context = json.loads(context_response.strip().lstrip("```json").rstrip("```"))
                except json.JSONDecodeError:
                    # If both fail, create a valid response from topics
                    print("Failed to parse context response, creating from topics")
                    context = {
                        "conversation_threads": [
                            {
                                "topic": topic["name"],
                                "context": " ".join(topic.get("sentences", [])),
                                "related_memories": [],
                                "sentiment": topic.get("emotional_tone", "neutral"),
                                "continuation": "new"
                            }
                            for topic in topics["topics"]
                        ]
                    }

            if not isinstance(context, dict) or "conversation_threads" not in context:
                print("Invalid context format, reconstructing from topics")
                context = {
                    "conversation_threads": [
                        {
                            "topic": topic["name"],
                            "context": " ".join(topic.get("sentences", [])),
                            "related_memories": [],
                            "sentiment": topic.get("emotional_tone", "neutral"),
                            "continuation": "new"
                        }
                        for topic in topics["topics"]
                    ]
                }

            print("\nContext Analysis:")
            print(json.dumps(context, indent=2))

            # Combine analyses
            return {
                "topics": topics["topics"],
                "context": context["conversation_threads"]
            }

        except json.JSONDecodeError as e:
            print(f"Error parsing LLM response: {e}")
            print(
                "Raw response:",
                topic_response if "topic_response" in locals() else context_response,
            )
            # pylint: disable=raise-missing-from
            raise ValueError("Invalid JSON response from LLM")
        except KeyError as e:
            print(f"Missing required key in LLM response: {e}")
            print(
                "Topics response:",
                (
                    json.dumps(topics, indent=2)
                    if "topics" in locals()
                    else "Not available"
                ),
            )
            print(
                "Context response:",
                (
                    json.dumps(context, indent=2)
                    if "context" in locals()
                    else "Not available"
                ),
            )
            # pylint: disable=raise-missing-from
            raise ValueError(f"Missing required key in LLM response: {e}")
        except Exception as e:
            print(f"Unexpected error in analysis: {e}")
            raise

    def plan_memory_updates(self, analysis: Dict, transcriptions: Dict) -> Dict:
        """Second step: Plan memory block updates"""
        print("\n=== PLANNING PHASE ===")

        planning_prompt = f"""
You are a memory organization expert. Create a plan to organize these conversations into memory blocks.

Analysis:
{json.dumps(analysis, indent=2)}

Raw Transcriptions:
{json.dumps([t.get('text', '') for t in transcriptions.values()], indent=2)}

RETURN ONLY THE JSON OBJECT BELOW - NO OTHER TEXT.
You MUST return your response in this EXACT format:
{{
    "memory_blocks": [
        {{
            "topic": "specific_topic_name",
            "type": "new_memory",
            "priority": 1-5,
            "structure": {{
                "main_points": ["point 1", "point 2"],
                "context": "specific context",
                "sentiment": "tone of conversation"
            }}
        }}
    ]
}}

Requirements:
1. Each topic must have at least one memory block
2. Include specific context and structure for each block
3. Focus on meaningful content, ignore filler or noise
4. Maintain conversation context and flow
5. The response MUST have a 'memory_blocks' key at the root level
6. Return ONLY the JSON object above. DO NOT include any explanatory text.
"""
        try:
            plan_response = self.client.generate_text(planning_prompt)
            plan = json.loads(plan_response.strip().lstrip("```json").rstrip("```"))

            print("\nMemory Block Plan:")
            print(json.dumps(plan, indent=2))

            if not plan.get("memory_blocks"):
                raise ValueError("Invalid plan format: missing memory_blocks")

            return plan

        except (json.JSONDecodeError, KeyError) as e:
            print(f"Error in planning phase: {e}")
            print("Raw response:", plan_response)
            # pylint: disable=raise-missing-from
            raise ValueError("Invalid planning response from LLM")

    def execute_memory_updates(self, plan: Dict, transcriptions: Dict) -> Dict:
        """Final step: Create actual memory block content"""
        print("\n=== EXECUTION PHASE ===")

        memory_updates = []
        for block in plan.get("memory_blocks", []):
            content_prompt = f"""
You are a precise memory writer. Create the content for this memory block:

Memory Block Plan:
{json.dumps(block, indent=2)}

Available Transcriptions:
{json.dumps([t.get('text', '') for t in transcriptions.values()], indent=2)}

RETURN ONLY THE JSON OBJECT BELOW - NO OTHER TEXT.
You MUST return your response in this EXACT format:
{{
    "memory_update": {{
        "action": "create",
        "content": {{
            "topic": "exact_topic_name",
            "sentences": ["complete sentence 1", "complete sentence 2"],
            "summary": "brief summary of the content",
            "context": "detailed context",
            "dalle_prompt": "prompt for dalle 3 based on the content of the conversation",
            "metadata": {{
                "emotional_tone": "specific tone",
                "importance_level": 1-5,
                "timestamp": "{datetime.now().strftime('%Y-%m-%d %H-%M-%S')}",
                "conversation_type": "type of conversation",
                "visual_style": "style of visual representation"
            }}
        }}
    }}
}}

Requirements:
1. Include ALL relevant sentences from transcriptions
2. Maintain original meaning and context
3. Clean up and format sentences properly
4. Include meaningful metadata
5. The response MUST have a 'memory_update' key at the root level
6. Return ONLY the JSON object above. NO text before or after. NO explanations.
"""
            try:
                content_response = self.client.generate_text(content_prompt)
                content = json.loads(
                    content_response.strip().lstrip("```json").rstrip("```")
                )

                if not content.get("memory_update"):
                    raise ValueError("Invalid memory update format")

                memory_updates.append(content["memory_update"])

            # pylint: disable=broad-exception-caught
            except Exception as e:
                print(f"Error processing memory block {block.get('topic')}: {e}")
                print("Raw response:", content_response)
                continue

        if not memory_updates:
            raise ValueError("No valid memory updates generated")

        result = {"memory_updates": memory_updates}
        print("\nGenerated Memory Updates:")
        print(json.dumps(result, indent=2))
        return result


class MemoryManager:
    """Manages the entire memory processing pipeline"""

    def __init__(self):
        self.last_run = datetime.now()
        self.db = Database()
        self.client = GroqClient(GroqModelConfig(temperature=0.3))
        self.processor = MemoryProcessor(self.db, self.client)
        self.processing_stats = {
            "total_processed": 0,
            "successful_updates": 0,
            "failed_updates": 0,
            "last_error": None,
        }

    def process_transcriptions(self):
        """Main processing pipeline for transcriptions"""
        try:
            print("\n========== STARTING MEMORY PROCESSING ==========")
            print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

            # Get transcriptions from the last minute (with 2s buffer)
            current = datetime.now()
            minute_ago = (current - timedelta(seconds=62)).strftime("%Y-%m-%d %H-%M-%S")

            # Fetch and validate transcriptions
            new_transcriptions = self._fetch_transcriptions(minute_ago)
            if not new_transcriptions:
                return

            # Process the transcriptions
            self._process_batch(new_transcriptions)
        # pylint: disable=broad-exception-caught
        except Exception as e:
            self._handle_error(e)
        finally:
            self._update_stats()
            self._log_completion(current)

    def _fetch_transcriptions(self, since_timestamp: str) -> Dict:
        """Fetch and validate new transcriptions"""
        new_transcriptions = self.db.get_transcriptions(since_timestamp)

        if not new_transcriptions:
            print("No new transcriptions to process")
            return {}

        print(f"\nFetched {len(new_transcriptions)} new transcriptions")

        # Validate transcriptions
        valid_transcriptions = {}
        for key, trans in new_transcriptions.items():
            if self._validate_transcription(trans):
                valid_transcriptions[key] = trans
            else:
                print(f"Skipping invalid transcription: {key}")

        return valid_transcriptions

    def _validate_transcription(self, transcription: Dict) -> bool:
        """Validate a transcription entry"""
        required_fields = ["text", "timestamp"]
        return all(
            field in transcription and transcription[field] for field in required_fields
        )

    def _process_batch(self, transcriptions: Dict):
        """Process a batch of transcriptions"""
        # Get existing memories for context
        existing_memories = self.db.get_memories() or {}
        print(f"Current memory blocks: {len(existing_memories)}")

        try:
            analysis = self.processor.analyze_transcriptions(transcriptions)
            if not self._validate_analysis(analysis):
                raise ValueError("Invalid analysis result")

            update_plan = self.processor.plan_memory_updates(analysis, transcriptions)
            if not self._validate_plan(update_plan):
                raise ValueError("Invalid update plan")

            memory_updates = self.processor.execute_memory_updates(update_plan, transcriptions)
            if not self._validate_updates(memory_updates):
                raise ValueError("Invalid memory updates")

            # Step 4: Apply updates
            self._apply_updates(memory_updates.get("memory_updates", []))

            # Step 5: Cleanup
            self._cleanup_transcriptions(transcriptions)

        except Exception as e:
            print(f"Error in processing batch: {str(e)}")
            raise

    def _validate_analysis(self, analysis: Dict) -> bool:
        """Validate the analysis output"""
        return (
            isinstance(analysis, dict)
            and "topics" in analysis
            and "context" in analysis
            and isinstance(analysis["topics"], list)
            and isinstance(analysis["context"], list)
        )

    def _validate_plan(self, plan: Dict) -> bool:
        """Validate the update plan"""
        return (
            isinstance(plan, dict)
            and "memory_blocks" in plan
            and isinstance(plan["memory_blocks"], list)
            and all(
                isinstance(block, dict) and "topic" in block and "structure" in block
                for block in plan["memory_blocks"]
            )
        )

    def _validate_updates(self, updates: Dict) -> bool:
        """Validate the memory updates"""
        return (
            isinstance(updates, dict)
            and "memory_updates" in updates
            and isinstance(updates["memory_updates"], list)
            and all(
                isinstance(update, dict) and "action" in update and "content" in update
                for update in updates["memory_updates"]
            )
        )

    def _apply_updates(self, updates: List[Dict]):
        """Apply memory updates with error handling"""
        print(f"\nApplying {len(updates)} updates to memory system")

        for i, update in enumerate(updates, 1):
            try:
                print(f"\nUpdate {i}/{len(updates)}:")
                self._apply_single_update(update)
                self.processing_stats["successful_updates"] += 1
            # pylint: disable=broad-exception-caught
            except Exception as e:
                print(f"Error in update {i}: {str(e)}")
                self.processing_stats["failed_updates"] += 1

    def _apply_single_update(self, update: Dict):
        """Apply a single memory update"""
        action = update.get("action")
        memory_id = update.get("memory_id")
        content = update.get("content")

        if not content:
            raise ValueError("Update missing content")

        if action == "create":
            print(f"Creating new memory block: {content.get('topic')}")
            content["timestamp"] = datetime.now().strftime("%Y-%m-%d %H-%M-%S")
            self.db.create_memory(content)
        elif action == "update" and memory_id:
            self._update_existing_memory(memory_id, content)
        elif action == "merge":
            self._merge_memory_blocks(update)
        else:
            raise ValueError(f"Invalid action: {action}")

    def _update_existing_memory(self, memory_id: str, content: Dict):
        """Update an existing memory block"""
        print(f"Updating memory block: {memory_id}")
        print(f"Topic: {content.get('topic')}")

        existing = self.db.get_memory(memory_id)
        if not existing:
            raise ValueError(f"Memory block not found: {memory_id}")

        updated = self._merge_memory_content(existing, content)
        self.db.update_memory(memory_id, updated)
        print(f"Updated with {len(content.get('sentences', []))} new sentences")

    def _merge_memory_blocks(self, update: Dict):
        """Merge multiple memory blocks"""
        source_ids = update.get("source_memory_ids", [])
        content = update.get("content")

        print(f"Merging {len(source_ids)} memory blocks")
        print(f"New topic: {content.get('topic')}")

        self.db.create_memory(content)
        for source_id in source_ids:
            print(f"Deleting merged block: {source_id}")
            self.db.delete_memory(source_id)

    def _cleanup_transcriptions(self, transcriptions: Dict):
        """Clean up processed transcriptions"""
        print(f"\nCleaning up {len(transcriptions)} processed transcriptions")
        for key in transcriptions:
            self.db.delete_transcription(key)
            self.processing_stats["total_processed"] += 1

    def _handle_error(self, error: Exception):
        """Handle pipeline errors"""
        print("\n!!! ERROR IN MEMORY PIPELINE !!!")
        print(f"Error type: {type(error).__name__}")
        print(f"Error message: {str(error)}")
        print("Stack trace:")

        traceback.print_exc()

        self.processing_stats["last_error"] = {
            "type": type(error).__name__,
            "message": str(error),
            "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        }

    def _update_stats(self):
        """Update processing statistics"""
        print("\n=== PROCESSING STATS ===")
        print(f"Total processed: {self.processing_stats['total_processed']}")
        print(f"Successful updates: {self.processing_stats['successful_updates']}")
        print(f"Failed updates: {self.processing_stats['failed_updates']}")
        last_error = self.processing_stats.get("last_error")
        if last_error and isinstance(last_error, dict):
            print(f"Last error: {last_error.get('message')}")

    def _log_completion(self, start_time: datetime):
        """Log completion status"""
        print("\n=== PROCESSING COMPLETE ===")
        print(f"Time taken: {datetime.now() - start_time}")
        print("==========================================\n")
        self.last_run = datetime.now()

    def _merge_memory_content(self, existing: Dict, new: Dict) -> Dict:
        """Merge new content into existing memory block"""
        existing["sentences"].extend(new.get("sentences", []))
        existing["context"] = new.get("context", existing["context"])
        existing["emotional_tone"] = new.get(
            "emotional_tone", existing.get("emotional_tone")
        )
        existing["importance_level"] = new.get(
            "importance_level", existing.get("importance_level")
        )
        existing["metadata"] = {
            **existing.get("metadata", {}),
            **new.get("metadata", {}),
        }
        existing["last_updated"] = datetime.now().strftime("%Y-%m-%d %H-%M-%S")
        return existing